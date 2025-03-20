import React, { useEffect, useState } from 'react';
import { RxCross2 } from 'react-icons/rx';

const CodeRunner = ({ currentFile, fileTree, setIsPreviewOpen }) => {
    const [iframeCode, setIframeCode] = useState('');

    useEffect(() => {
        if (currentFile && fileTree[currentFile] && currentFile.endsWith('.html')) {
            const htmlContent = fileTree[currentFile]?.file?.contents || '';
            const cssContent = fileTree['style.css']?.file?.contents || '';
            const jsContent = fileTree['script.js']?.file?.contents || '';

            // Embed CSS and JS into the selected HTML file
            const combinedHtml = `
                <html>
                    <head>
                        <title>Live Preview</title>
                        <style>${cssContent}</style> <!-- Embed CSS -->
                    </head>
                    <body>
                        ${htmlContent} <!-- Load the selected .html file -->
                        <script>${jsContent}</script> <!-- Embed JS -->
                    </body>
                </html>
            `;

            setIframeCode(combinedHtml);
        }
    }, [currentFile, fileTree]);

    return (
        <>
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white w-[90vw] h-[90vh] relative p-2 rounded-md shadow-lg">
                    <button
                        className="absolute top-2 right-2 text-white bg-slate-700 px-1 py-1 rounded"
                        onClick={() => setIsPreviewOpen(false)}
                    >
                        <RxCross2 size={14} />
                    </button>
                    <iframe
                        key={iframeCode} // Force re-render on change
                        title="Live Preview"
                        srcDoc={iframeCode}
                        style={{ width: '100%', height: '100%', border: 'none' }}
                        sandbox="allow-scripts allow-same-origin"
                    ></iframe>
                </div>
            </div>
        </>
    );
};

export default CodeRunner;
