import React, { useRef, useState, useCallback, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { ToastContainer, toast } from "react-toastify";

const AIInterface = () => {
  const { user, askQuestion, uploadPdf } = useAuth();
  const textareaRef = useRef(null);
  const borderRef = useRef(null);
  const fileInputRef = useRef(null);

  const [randomI, setRandomI] = useState(2);

  const [formData, setFormData] = useState({
    prompt: "",
    files: [],
  });

  const [messages, setMessages] = useState([]);

  const [loading, setloading] = useState(false);

  const generatePreview = useCallback((file) => {
    if (file.type.startsWith("image/")) {
      return URL.createObjectURL(file);
    }
    return "/file-icon.svg";
  }, []);

  const handleInput = (e) => {
    const newPrompt = e.target.value;
    setFormData((prev) => ({ ...prev, prompt: newPrompt }));
    e.target.style.height = "20px";
    e.target.style.height = `${e.target.scrollHeight}px`;
    borderRef.current.classList.toggle(
      "rounded-lg",
      e.target.scrollHeight >= 150
    );
  };

  const handleFileUpload = (e) => {
    const newFiles = Array.from(e.target.files).map((file) => ({
      file,
      preview: generatePreview(file),
      name: file.name,
      size: (file.size / 1024).toFixed(1) + " KB",
    }));
    setFormData((prev) => ({ ...prev, files: [...prev.files, ...newFiles] }));
  };

  const removeFile = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setloading(true);

    const prompt = formData.prompt.trim();
    const hasPrompt = prompt !== "";
    const hasFiles = formData.files.length > 0;

    if (!hasPrompt && !hasFiles) {
      setloading(false);
      // alert("Enter Prompt/File");
      toast("Enter Prompt/File");
      return;
    }

    // 1) Create user message
    const userMessage = {
      id: Date.now(),
      date: new Date().toLocaleString(),
      role: "user",
      prompt,
      files: formData.files,
    };

    // Optimistically add user message
    setMessages((prev) => [...prev, userMessage]);

    let aiText = "";

    try {
      // CASE 1: Only files, no question
      if ((hasFiles && hasPrompt) || hasFiles) {
        const uploadResults = [];
        for (const f of formData.files) {
          const res = await uploadPdf(f);
          uploadResults.push(res);
        }
        console.log("uploadResults", uploadResults);
        toast(
          "This file is Saved for 10 mins After that file is automatically removed!!"
        );

        let res;
        for (const result of uploadResults) {
          if (result?.extracted_text) {
            localStorage.setItem(
              "PDFSummery",
              JSON.stringify(result?.extracted_text)
            );
            res = await askQuestion({
              question: prompt,
              text: result.extracted_text,
            });
            console.log("airepppp", res);
          }
        }
        aiText = res?.response?.content || "Data not found";
      }

      // CASE 2: Only question, no files
      else if (hasPrompt) {
        let PDFSummery = localStorage.getItem("PDFSummery");
        const res = await askQuestion({
          question: prompt,
          text: PDFSummery ? PDFSummery : null,
        });
        aiText = res?.response?.content || "Data not found";
      }

      // CASE 3: Both files and question
      // else if (hasPrompt && hasFiles) {
      //   const uploadResults = [];
      //   for (const f of formData.files) {
      //     const res = await uploadPdf(f);
      //     uploadResults.push(res);
      //   }
      //   const res = await askQuestion({
      //     question: prompt,
      //     text: null,
      //   });
      //   aiText = res?.response?.content || "Data not found";
      // }
    } catch (err) {
      console.error("Error in submit:", err);
      aiText = "Sorry, something went wrong.";
    } finally {
      setloading(false);
    }

    // 2) Assistant message
    const assistantMessage = {
      id: Date.now() + 1,
      date: new Date().toLocaleString(),
      role: "assistant",
      answer: aiText,
    };

    setMessages((prev) => [...prev, assistantMessage]);

    // 3) Cleanup previews and reset draft
    formData.files.forEach((f) => {
      if (f.preview && f.preview.startsWith("blob:")) {
        URL.revokeObjectURL(f.preview);
      }
    });

    setFormData({ prompt: "", files: [] });
    if (textareaRef.current) {
      textareaRef.current.style.height = "20px";
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const quotes = [
    "What’s on the agenda today?",
    `Hey, ${user?.name}. Ready to dive in?`,
    "Ready when you are.",
    "What’s on your mind today?",
    "What are you working on?",
    `Good to see you, ${user?.name}`,
  ];
  localStorage.getItem("PDFSummery") &&
    setTimeout(() => {
      // alert("file removed");
      toast("File has been removed!!");
      localStorage.removeItem("PDFSummery");
    }, 600000);

  useEffect(() => {
    setRandomI(Math.floor(Math.random() * quotes.length));
  }, []);

  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover={false}
        theme="dark"
      />
      <div className="ai-text-box-container flex flex-col justify-center h-full relative">
        {/* Header */}
        {messages.length === 0 && (
          <div>
            <h1 className="text-3xl font-bold pb-4 sm:pb-6 lg:pb-8 text-center">
              {quotes[randomI]}
            </h1>
          </div>
        )}

        {/* Chat history: user + assistant */}
        {messages.length > 0 && (
          <div className="all-chats w-full max-w-2xl mb-4 space-y-3 max-h-[80vh] overflow-y-scroll mx-auto px-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col gap-2 p-3 rounded-lg ${
                  msg.role === "user"
                    ? "items-end bg-transparent"
                    : "items-start bg-muted/30"
                }`}
              >
                {/* Files (user messages) */}
                {msg.role === "user" &&
                  msg.files?.map((uploadedFile, idx) => (
                    <div
                      key={idx}
                      className="w-12 h-12 rounded overflow-hidden bg-muted flex-shrink-0"
                    >
                      <img
                        src={uploadedFile.preview}
                        alt={uploadedFile.name}
                        className="w-full h-full  block"
                      />
                    </div>
                  ))}

                {/* Text */}
                {msg.role === "user" && msg.prompt && (
                  <p className="text-sm bg-slate-700 text-white p-3 rounded-xl max-w-[450px]">
                    {msg.prompt}
                  </p>
                )}

                {msg.role === "assistant" && msg.answer && (
                  <p className="text-sm bg-slate-700 text-white  text-foreground p-3 rounded-xl max-w-[550px] shadow-sm">
                    {msg.answer}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Draft file chips */}
        {formData.files.length > 0 && (
          <div className="w-full max-w-2xl mx-auto flex flex-wrap gap-2 mb-4 p-2">
            {formData.files.map((uploadedFile, index) => (
              <div
                key={index}
                className="group relative bg-background border border-border rounded-lg p-2 max-w-xs flex items-center gap-2 shadow-sm hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 rounded flex items-center justify-center bg-muted overflow-hidden flex-shrink-0">
                  {uploadedFile.preview.startsWith("blob:") ? (
                    <img
                      src={uploadedFile.preview}
                      alt={uploadedFile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg
                      className="w-6 h-6 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">
                    {uploadedFile.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {uploadedFile.size}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="p-1 rounded-full hover:bg-destructive text-destructive opacity-0 group-hover:opacity-100 transition-all ml-auto"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.txt"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Input bar */}
        <div
          className="w-full max-w-2xl mx-auto bg-transparent dark:bg-muted/50 cursor-text bg-clip-padding p-2.5 px-3 shadow-lg border border-border rounded-full transition-all duration-200 relative"
          ref={borderRef}
        >
          <form className="flex items-center gap-2" onSubmit={handleSubmit}>
            {/* File Upload Button */}
            <div className="leading-[0]">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1 rounded-full hover:bg-accent transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-plus"
                >
                  <path d="M5 12h14" />
                  <path d="M12 5v14" />
                </svg>
              </button>
            </div>

            <textarea
              ref={textareaRef}
              value={formData.prompt}
              onInput={handleInput}
              placeholder="Ask me anything"
              className="flex-1 outline-none bg-transparent dark:text-foreground h-[20px] min-h-[30px] py-2 max-h-[150px] resize-none overflow-y-scroll whitespace-pre-wrap break-words border-0 leading-tight text-sm scrollbar-hide"
            />
            <div className="loader-wrapper">
              {loading ? (
                <div className="loader">
                  <svg width="35" height="35" viewBox="0 0 35 35">
                    <defs>
                      <mask id="clipping">
                        <polygon points="0,0 35,0 35,35 0,35" fill="black" />

                        <polygon
                          points="8.75,8.75 26.25,8.75 17.5,26.25"
                          fill="white"
                        />

                        <polygon
                          points="17.5,8.75 26.25,26.25 8.75,26.25"
                          fill="white"
                        />

                        <polygon
                          points="12.25,12.25 22.75,12.25 17.5,22.75"
                          fill="white"
                        />
                        <polygon
                          points="12.25,12.25 22.75,12.25 17.5,22.75"
                          fill="white"
                        />
                        <polygon
                          points="12.25,12.25 22.75,12.25 17.5,22.75"
                          fill="white"
                        />
                        <polygon
                          points="12.25,12.25 22.75,12.25 17.5,22.75"
                          fill="white"
                        />
                      </mask>
                    </defs>
                  </svg>

                  <div className="box"></div>
                </div>
              ) : (
                <div className="leading-[0]">
                  <button
                    type="submit"
                    className={`p-1 hover:bg-accent rounded-full transition-colors cursor-pointer `}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="25"
                      height="25"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-send"
                    >
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22,2 15,22 11,13 2,9 22,2" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AIInterface;
