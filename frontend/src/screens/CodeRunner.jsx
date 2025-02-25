import React, { useEffect, useState } from 'react';
import { RxCross2 } from 'react-icons/rx';

const CodeRunner = ({ currentFile, fileTree, setIsPreviewOpen }) => {
    const [iframeCode, setIframeCode] = useState('');

    useEffect(() => {
        if (currentFile && fileTree[currentFile]) {
            const indexHtml = fileTree['index.html']?.file?.contents || '';
            const cssContent = fileTree['style.css']?.file?.contents || '';
            const jsContent = fileTree['script.js']?.file?.contents || '';

            // Combine index.html, styles.css, and script.js into a single HTML document
            const combinedHtml = `
                <html>
                    <head>
                        <title>Live Preview</title>
                        <style>${cssContent}</style> <!-- Embedding styles directly here -->
                    </head>
                    <body>
                        ${indexHtml}
                        <script>${jsContent}</script> <!-- Embedding script directly here -->
                    </body>
                </html>
            `;

            // Inject combined HTML into iframe
            setIframeCode(combinedHtml);
        }
    }, [currentFile, fileTree]);

    return (
        <>
            {/* Iframe section for live preview */}
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white w-[90vw] h-[90vh] relative p-2 rounded-md shadow-lg">
                    <button
                        className="absolute top-2 right-2 text-white bg-slate-700 px-1 py-1 rounded"
                        onClick={() => setIsPreviewOpen(false)}
                    >
                        <RxCross2 size={14} />
                    </button>
                    <iframe
                        key={iframeCode} // Force re-render by changing the key
                        title="Live Preview"
                        srcDoc={iframeCode}
                        style={{ width: '100%', height: '100%', border: 'none' }}
                        sandbox="allow-scripts"
                    ></iframe>
                </div>
            </div>
        </>
    );
};

export default CodeRunner;