// Style configuration object
const STYLE_CONFIG = {
  fonts: {
    messages: {
      family: 'Arial',
      size: 14,
      timestampSize: 11
    },
    input: {
      family: 'Arial',
      size: 14
    }
  },
  colors: {
    background: '#F8F9FA',
    userBubble: '#007bff',
    botBubble: '#E9ECEF',
    userText: '#FFFFFF',
    botText: '#000000',
    userTimestamp: '#C8C8C8',
    botTimestamp: '#969696',
    inputBar: {
      background: '#FFFFFF',
      border: '#DEE2E6',
      focusBorder: '#007bff',
      shadow: 'rgba(0,0,0,0.05)'
    },
    sendButton: {
      background: '#007bff',
      hover: '#0056b3',
      text: '#FFFFFF'
    }
  },
  layout: {
    messageWidth: 0.7, // 70% of canvas width
    bubbleRadius: 10,
    messagePadding: 15,
    messageSpacing: 15,
    lineHeight: 30
  },
  input: {
    height: 60,
    padding: 15,
    buttonWidth: 80,
    buttonHeight: 40,
    fieldHeight: 40,
    borderRadius: 20
  }
};

// First define all classes
class OllamaClient {
  constructor(baseUrl = 'http://localhost:11434') {
    this.baseUrl = baseUrl;
    this.model = "gemma2:2b";
  }

  async sendMessage(message) {
    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          prompt: message,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Ollama API Error:', error);
      throw error;
    }
  }
}

class ChatUI {
  constructor() {
    this.messages = [];
    this.onMessageCallback = null;
  }

  addMessage(text, sender) {
    this.messages.push({
      text,
      sender,
      timestamp: new Date()
    });
    if (this.onMessageCallback) {
      this.onMessageCallback();
    }
  }

  onMessage(callback) {
    this.onMessageCallback = callback;
  }

  getMessages() {
    return this.messages;
  }
}

class ChatController {
  constructor(client, ui) {
    this.client = client;
    this.ui = ui;
    this.isWaitingForResponse = false;
  }

  async sendMessage(message) {
    if (this.isWaitingForResponse || !message) return;

    try {
      this.isWaitingForResponse = true;
      this.ui.addMessage(message, 'user');

      const response = await this.client.sendMessage(message);
      this.ui.addMessage(response, 'bot');
    } catch (error) {
      this.ui.addMessage(`Error: Make sure Ollama is running with model "${this.client.model}"`, 'bot');
    } finally {
      this.isWaitingForResponse = false;
    }
  }
}

// Global variables
let chatUI, controller, inputField, sendButton;
let scrollOffset = 0;

function setup() {
  // Create canvas and get its container
  const canvas = createCanvas(800, 600);
  const canvasContainer = canvas.elt.parentElement;
  canvasContainer.style.position = 'relative';

  // Initialize chat components
  const ollamaClient = new OllamaClient();
  chatUI = new ChatUI();
  controller = new ChatController(ollamaClient, chatUI);

  // Input container styling
  const inputContainer = createDiv('');
  inputContainer.parent(canvasContainer);
  inputContainer.style('position', 'absolute');
  inputContainer.style('bottom', '0');
  inputContainer.style('left', '0');
  inputContainer.style('width', '800px');
  inputContainer.style('height', `${STYLE_CONFIG.input.height}px`);
  inputContainer.style('background-color', STYLE_CONFIG.colors.inputBar.background);
  inputContainer.style('display', 'flex');
  inputContainer.style('align-items', 'center');
  inputContainer.style('padding', '0 20px');
  inputContainer.style('box-sizing', 'border-box');
  inputContainer.style('box-shadow', `0 -2px 10px ${STYLE_CONFIG.colors.inputBar.shadow}`);
  inputContainer.style('z-index', '1');

  // Input field styling
  inputField = createInput('');
  inputField.parent(inputContainer);
  inputField.style('flex', '1');
  inputField.style('height', `${STYLE_CONFIG.input.fieldHeight}px`);
  inputField.style('border', `1px solid ${STYLE_CONFIG.colors.inputBar.border}`);
  inputField.style('border-radius', `${STYLE_CONFIG.input.borderRadius}px`);
  inputField.style('padding', '0 20px');
  inputField.style('margin-right', '10px');
  inputField.style('font-family', STYLE_CONFIG.fonts.input.family);
  inputField.style('font-size', `${STYLE_CONFIG.fonts.input.size}px`);
  inputField.style('transition', 'border-color 0.2s');

  // Input field events
  inputField.elt.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      handleSend();
    }
  });

  inputField.elt.addEventListener('focus', function () {
    this.style.borderColor = STYLE_CONFIG.colors.inputBar.focusBorder;
    this.style.outline = 'none';
  });

  inputField.elt.addEventListener('blur', function () {
    this.style.borderColor = STYLE_CONFIG.colors.inputBar.border;
  });

  // Send button styling
  sendButton = createButton('Send');
  sendButton.parent(inputContainer);
  sendButton.style('width', `${STYLE_CONFIG.input.buttonWidth}px`);
  sendButton.style('height', `${STYLE_CONFIG.input.buttonHeight}px`);
  sendButton.style('background-color', STYLE_CONFIG.colors.sendButton.background);
  sendButton.style('color', STYLE_CONFIG.colors.sendButton.text);
  sendButton.style('border', 'none');
  sendButton.style('border-radius', `${STYLE_CONFIG.input.borderRadius}px`);
  sendButton.style('cursor', 'pointer');
  sendButton.style('font-family', STYLE_CONFIG.fonts.input.family);
  sendButton.style('font-size', `${STYLE_CONFIG.fonts.input.size}px`);
  sendButton.style('transition', 'background-color 0.2s');

  // Send button events
  sendButton.mousePressed(handleSend);
  sendButton.mouseOver(() => {
    sendButton.style('background-color', STYLE_CONFIG.colors.sendButton.hover);
  });
  sendButton.mouseOut(() => {
    sendButton.style('background-color', STYLE_CONFIG.colors.sendButton.background);
  });
}

function draw() {
  background(STYLE_CONFIG.colors.background);

  let y = 20 + scrollOffset;
  const messages = chatUI.getMessages();
  const messageWidth = width * STYLE_CONFIG.layout.messageWidth;

  messages.forEach(msg => {
    const x = msg.sender === 'user' ? width - messageWidth - 20 : 20;
    const wrappedText = msg.text.match(/.{1,80}/g) || [msg.text];
    const messageHeight = wrappedText.length * STYLE_CONFIG.layout.lineHeight + 40;

    if (y + messageHeight > 0 && y < height - STYLE_CONFIG.input.height) {
      // Message bubble
      fill(msg.sender === 'user' ?
        STYLE_CONFIG.colors.userBubble :
        STYLE_CONFIG.colors.botBubble
      );
      rect(x, y, messageWidth, messageHeight, STYLE_CONFIG.layout.bubbleRadius);

      // Message text
      textFont(STYLE_CONFIG.fonts.messages.family);
      textSize(STYLE_CONFIG.fonts.messages.size);
      fill(msg.sender === 'user' ?
        STYLE_CONFIG.colors.userText :
        STYLE_CONFIG.colors.botText
      );

      wrappedText.forEach((line, i) => {
        text(line,
          x + STYLE_CONFIG.layout.messagePadding,
          y + 25 + (i * STYLE_CONFIG.layout.lineHeight)
        );
      });

      // Timestamp
      textSize(STYLE_CONFIG.fonts.messages.timestampSize);
      fill(msg.sender === 'user' ?
        STYLE_CONFIG.colors.userTimestamp :
        STYLE_CONFIG.colors.botTimestamp
      );
      text(
        msg.timestamp.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        }),
        x + STYLE_CONFIG.layout.messagePadding,
        y + messageHeight - 15
      );
    }

    y += messageHeight + STYLE_CONFIG.layout.messageSpacing;
  });
}

function handleSend() {
  const message = inputField.value();
  if (message) {
    controller.sendMessage(message);
    inputField.value('');

    // Scroll to bottom
    const messages = chatUI.getMessages();
    let totalHeight = messages.reduce((height, msg) => {
      const lines = msg.text.match(/.{1,80}/g) || [msg.text];
      return height + (lines.length * STYLE_CONFIG.layout.lineHeight + 55);
    }, 0);

    scrollOffset = -Math.max(0, totalHeight - (height - STYLE_CONFIG.input.height - 40));
  }
}

function mouseWheel(event) {
  scrollOffset += event.delta;

  const messages = chatUI.getMessages();
  let totalHeight = messages.reduce((height, msg) => {
    const lines = msg.text.match(/.{1,80}/g) || [msg.text];
    return height + (lines.length * STYLE_CONFIG.layout.lineHeight + 55);
  }, 0);

  const maxScroll = -Math.max(0, totalHeight - (height - STYLE_CONFIG.input.height - 40));
  scrollOffset = constrain(scrollOffset, maxScroll, 0);

  return false;
}