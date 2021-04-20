import React from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { io } from "socket.io-client";

const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }],
  [{ list: "ordered" }, { list: "bullet" }],
  ["bold", "italic", "underline"],
  [{ color: [] }, { background: [] }],
  [{ script: "sub" }, { script: "super" }],
  [{ align: [] }],
  ["image", "blockquote", "code-block"],
  ["clean"],
];
export default function TextEditor() {
  const [socket, socketSet] = React.useState(null);
  const [quill, quillSet] = React.useState(null);
  React.useEffect(() => {
    const s = io("http://localhost:3001");
    socketSet(s);
    return () => s.disconnect();
  }, []);
  React.useEffect(() => {
    if (!quill || !socket) return;
    const sendHandler = (delta, oldDelta, source) => {
      if (source !== "user") return;
      socket.emit("send-changes", delta);
    };
    const recvHandler = (delta) => {
      quill.updateContents(delta);
    };
    quill.on("text-change", sendHandler);
    socket.on("receive-changes", recvHandler);
    return () => {
      quill.off(sendHandler);
      socket.off(recvHandler);
    };
  }, [socket, quill]);
  const wrapperRef = React.useCallback((wrapper) => {
    if (!wrapper) return;
    wrapper.innerHTML = "";
    const editor = document.createElement("div");
    wrapper.append(editor);
    quillSet(
      new Quill(editor, {
        theme: "snow",
        modules: { toolbar: TOOLBAR_OPTIONS },
      })
    );
  }, []);
  return <div className="container" ref={wrapperRef}></div>;
}
