import { useEffect, useRef, useState } from "react";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
  detectedLanguage?: string;
  summarizedText?: string;
}

const MessagePage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>("");
  const [detectedLanguage, setDetectedLanguage] = useState<string>("");
  const [sourceLanguage, setSourceLanguage] = useState<string>("en");
  const [targetLanguage, setTargetLanguage] = useState<string>("fr");
  const [translatedText, setTranslatedText] = useState<string>("");
  const [summary, setSummary] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Handle input field changes
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    handleTranslate();
    handleDetectLanguage();
    handleSummarize();
  };
  const handleTargetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTargetLanguage(e.target.value);
  };

  // Function to translate text
  const handleTranslate = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    try {
      if (!("ai" in self) || !("translator" in self.ai)) {
        throw new Error("Translator API is not supported in this browser.");
      }

      const translator = await self.ai.translator.create({
        sourceLanguage, // Use detected language or default to English
        targetLanguage, // Change to your desired target language
      });

      const result = await translator.translate(inputText);
      setTranslatedText(result);
    } catch (error) {
      console.error("Translation failed:", error);
      setTranslatedText("Translation failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to detect language
  const handleDetectLanguage = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    try {
      if (!("ai" in self) || !("languageDetector" in self.ai)) {
        throw new Error(
          "Language Detection API is not supported in this browser."
        );
      }

      const detector = await self.ai.languageDetector.create();
      const result = await detector.detect(inputText);
      if (result.length > 0) {
        setDetectedLanguage(result[0].detectedLanguage);
      } else {
        setDetectedLanguage("Unknown");
      }
    } catch (error) {
      console.error("Language detection failed:", error);
      setDetectedLanguage("Detection failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to summarize text
  const handleSummarize = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    try {
      if (!("ai" in self) || !("summarizer" in self.ai)) {
        throw new Error("Summarizer API is not supported in this browser.");
      }

      const summarizer = await self.ai.summarizer.create({
        sharedContext: "This is a general context for summarization.",
        type: "key-points",
        format: "plain-text",
        length: "short",
      });

      const summaryResult = await summarizer.summarize(inputText);
      setSummary(summaryResult);
    } catch (error) {
      console.error("Summarization failed:", error);
      setSummary("Summarization failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSummary = () => {
    if (inputText.trim() === "") return; // Prevent sending empty messages

    const newMessage: Message = {
      id: Date.now(),
      text: inputText,
      sender: "user",
      detectedLanguage: detectedLanguage,
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInputText("");

    // Simulating a bot reply after the message is sent
    setTimeout(() => {
      const botReply: Message = {
        id: Date.now() + 1,
        text: summary,
        sender: "bot",
        detectedLanguage: detectedLanguage,
      };
      setMessages((prevMessages) => [...prevMessages, botReply]);
      setIsLoading(false);
    }, 1500); // Simulate a delay for bot reply
  };

  // Handle sending the message
  const handleSendMessage = () => {
    if (inputText.trim() === "") return; // Prevent sending empty messages

    const newMessage: Message = {
      id: Date.now(),
      text: inputText,
      sender: "user",
      detectedLanguage: detectedLanguage,
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  const handleTranMessage = () => {
    if (inputText.trim() === "") return; // Prevent sending empty messages

    // Simulating a bot reply after the message is sent
    setTimeout(() => {
      const botReply: Message = {
        id: Date.now() + 1,
        text: translatedText,
        sender: "bot",
        detectedLanguage: detectedLanguage,
      };
      setMessages((prevMessages) => [...prevMessages, botReply]);
      setInputText("");
      setIsLoading(false);
    }, 1500); // Simulate a delay for bot reply
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="max-w-4xl mx-auto p-4 flex flex-col bg-gray-700 justify-between h-auto min-h-[100vh]">
      <div className="flex-1 p-4 rounded-lg space-y-4">
        {messages.length === 0 ? (
          <p className="text-center text-gray-400 text-lg">
            Start the conversation!
          </p>
        ) : (
          messages.map((message) => (
            <div>
              {message.sender === "user" ? (
                <div
                  key={message.id}
                  className="p-4 rounded-[20px] sm:max-w-[70%] w-[95%] bg-gradient-to-r from-orange-500 to-orange-800 text-white rounded-tl-none"
                >
                  <p className="mx-2.5">
                    {message.text}
                    <p className="text-[15px] text-left text-black">
                      {message.detectedLanguage}
                    </p>
                  </p>
                  <div className="flex flex-col sm:flex-row">
                    <div className="flex w-[30%]">
                      {" "}
                      <label className="flex mx-2.5 justify-between items-center">
                        <select
                          defaultValue="en"
                          value={sourceLanguage}
                          onChange={(e) => setSourceLanguage(e.target.value)}
                          className="bg-black bg-opacity-20 w-[50px] h-[30px]  md:text-[15px] text-[10px] text-white rounded-md focus:outline-none hover:bg-blue-600"
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="pt">Portuguese</option>
                          <option value="ru"> Russian</option>
                          <option value="tr">Turkish</option>
                          <option value="fr">French</option>
                        </select>
                      </label>
                      <p className="my-auto mx-auto">to</p>
                      <label className="flex mx-2.5 justify-between items-center">
                        <select
                          defaultValue="fr"
                          value={targetLanguage}
                          onChange={handleTargetChange}
                          className="bg-black bg-opacity-20 w-[50px] h-[30px]  md:text-[15px] text-[10px] text-white rounded-md focus:outline-none hover:bg-blue-600"
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="pt">Portuguese</option>
                          <option value="ru"> Russian</option>
                          <option value="tr">Turkish</option>
                          <option value="fr">French</option>
                        </select>
                      </label>
                    </div>
                    <button
                      onClick={handleTranMessage}
                      className="bg-blue-500 text-white px-6 md:text-[15px] mx-2.5 text-[10px] my-2.5 py-3 rounded-md focus:outline-none hover:bg-blue-600"
                    >
                      Translate
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-[20px]  max-w-[60%] bg-gray-100 text-black rounded-tr-none ml-auto">
                  <p>{message.text}</p>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {isLoading && (
        <div className="text-center text-white italic">Translating...</div>
      )}

      <div className="flex sticky bottom-0 flex-col items-center rounded-md bg-black space-x-4  ">
        <textarea
          value={inputText}
          onChange={handleInputChange}
          placeholder="Type your message..."
          className="w-[90%] border border-none focus:outline-none p-2 bg-black rounded-md resize-none"
        />

        <div className="flex">
          <div className="flex">
            <button
              onClick={handleSummary}
              className="bg-blue-500 md:text-[15px] text-white text-[10px] px-6 mx-2.5  my-2.5 py-3 rounded-md focus:outline-none hover:bg-blue-600"
            >
              Summary
            </button>
            <button
              onClick={handleSendMessage}
              className="bg-blue-500 md:text-[15px] text-white text-[10px] px-6 mx-2.5  my-2.5 py-3 rounded-md focus:outline-none hover:bg-blue-600"
            >
              Send
            </button>
          </div>
        </div>
      </div>
      <div></div>
    </div>
  );
};

export default MessagePage;
