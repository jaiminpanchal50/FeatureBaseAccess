import React, { useRef, useState, useCallback, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const AIInterface = () => {
  const { user } = useAuth();
  const textareaRef = useRef(null);
  const borderRef = useRef(null);
  const fileInputRef = useRef(null);
  const [randomI, setrandomI] = useState(2);
  const [formData, setFormData] = useState({
    prompt: "",
    files: [],
  });

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
    console.log("Selected files:", newFiles);
  };

  const removeFile = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Allow: prompt only, files only, or both
    const hasPrompt = formData.prompt.trim() !== "";
    const hasFiles = formData.files.length > 0;

    if (!hasPrompt && !hasFiles) return; // Nothing to send

    console.log("FORM SUBMIT:", {
      prompt: formData.prompt.trim() || null,
      files: formData.files,
    });

    // Cleanup image previews
    formData.files.forEach((f) => {
      if (f.preview && f.preview.startsWith("blob:")) {
        URL.revokeObjectURL(f.preview);
      }
    });

    // Reset form
    setFormData({ prompt: "", files: [] });
    textareaRef.current.style.height = "20px";
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const quotes = [
    "What’s on the agenda today?",
    `Hey, ${user?.name}. Ready to dive in?`,
    "Ready when you are.",
    "What’s on your mind today?",
    "What are you working on?",
    ` Good to see you, ${user?.name}`,
  ];

  const randomQ = () => {
    let i = Math.floor(Math.random() * 6);
    setrandomI(i);
  };
  useEffect(() => {
    randomQ();
  }, []);

  return (
    <>
      <div className="ai-text-box-container flex flex-col items-center justify-center h-full relative">
        <div>
          <h1 className="text-3xl font-bold pb-4 sm:pb-6 lg:pb-8 text-center">
            {quotes[randomI]}
          </h1>
        </div>

        {/* Uploaded Files Preview */}
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

        <div
          className="w-full max-w-2xl mx-auto bg-transparent dark:bg-muted/50 cursor-text bg-clip-padding p-2.5 px-3 shadow-lg border border-border rounded-full transition-all duration-200"
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

            <div className="leading-[0]">
              <button
                type="submit"
                className="p-1 opacity-50 hover:bg-accent rounded-full transition-colors cursor-pointer"
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
          </form>
        </div>
      </div>
    </>
  );
};

export default AIInterface;
