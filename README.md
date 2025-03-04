🌟 Overview
This project provides a simple yet powerful interface between p5.js creative coding environments and locally-running Ollama language models. It was developed by Arnab Chakravarty and Gabriella Garcia as part of a grant by AIxDesign, with the goal of democratizing access to AI capabilities for artists, designers, and creative coders.


✨ Features

- Clean, responsive chat UI built entirely with p5.js
- Direct integration with locally-running Ollama models
- Customizable appearance and behavior
- Low-latency responses for interactive applications
- No cloud dependencies - everything runs locally
- Perfect starting point for creative coding projects that incorporate AI

🚀 Getting Started

Prerequisites

Install Ollama on your local machine
Pull a model like Llama3:
Copyollama pull llama3:8b

Make sure Ollama is running on http://localhost:11434 (default)

Quick Start

Clone this repository:
Copygit clone https://github.com/yourusername/p5js-ollama-chat.git

Open the project in a local web server (due to CORS restrictions, this won't work by just opening the HTML file directly)

Using Python:
Copypython -m http.server

Using Node.js:
Copynpx serve

Using p5.js Editor or Visual Studio Code Live Server plugin


Navigate to the local server in your browser (typically http://localhost:8000 or similar)
Start chatting with your local AI!

🧩 Project Structure

sketch.js - Main p5.js sketch with the chat interface implementation
index.html - Basic HTML structure that loads p5.js and the sketch
style.css - Optional additional styling

🔧 Customization
Changing the Ollama Model
The default model is set to "llama3:8b". To use a different model, modify the following line in the OllamaClient constructor:
javascriptCopythis.model = "llama3:8b"; // Change to your preferred model
UI Customization
Adjust the following variables in sketch.js to customize the appearance:
javascriptCopyconst MESSAGE_HEIGHT = 100;
const MESSAGE_PADDING = 20;
const INPUT_HEIGHT = 60;
const INPUT_PADDING = 15;
const BUTTON_WIDTH = 70;
const BUTTON_HEIGHT = 40;
🤝 Contributing
Contributions are welcome! Feel free to open issues or submit PRs to improve this project.

Fork the repository
Create your feature branch (git checkout -b feature/amazing-feature)
Commit your changes (git commit -m 'Add some amazing feature')
Push to the branch (git push origin feature/amazing-feature)
Open a Pull Request

📝 License
This project is licensed under the MIT License - see the LICENSE file for details.
🙏 Acknowledgments

This project was created by Arnab Chakravarty and Gabriella Garcia
Supported by a grant from AIxDesign
Built with p5.js and Ollama
Special thanks to the open-source AI and creative coding communities

📞 Contact
For questions or suggestions, please open an issue in this repository.
