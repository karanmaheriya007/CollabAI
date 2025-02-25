import React, { useState, useEffect } from "react";
import { ChevronUp, ChevronDown } from "lucide-react"; // Icons for buttons

const Terminal = ({ fileTree, currentFile }) => {
    const [terminalOutput, setTerminalOutput] = useState([]);
    const [isExpanded, setIsExpanded] = useState(false);

    // Capture console.log output once when the component mounts
    useEffect(() => {
        const originalConsoleLog = console.log;
        console.log = (...args) => {
            // Capture the output and store it in the state
            setTerminalOutput((prevOutput) => [...prevOutput, args.join(' ')]);
            // Call the original console.log to maintain normal behavior
            originalConsoleLog(...args);
        };

        // Cleanup function to restore the original console.log when the component unmounts
        return () => {
            console.log = originalConsoleLog;
        };
    }, []); // Empty dependency array ensures this runs only once on mount

    const executeCode = () => {
        if (!currentFile || !fileTree[currentFile]) return;

        const code = fileTree[currentFile].file.contents;
        try {
            // Execute the code
            eval(code);
        } catch (error) {
            // Handle errors
            setTerminalOutput((prevOutput) => [...prevOutput, `Error: ${error.message}`]);
        }
    };

    return (
        <div className={`terminal ${isExpanded ? "h-full" : "h-40"} overflow-hidden bg-[#1e1e1e] border-t border-[#676767] text-white p-4 pb-16 custom-scrollbar transition-all duration-300`}>
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold">Terminal Output</h3>
                <div className="flex items-center">
                    <button
                        className="bg-[#424242] text-white px-4 py-[3px] rounded hover:bg-[#606060] transition"
                        onClick={executeCode}>
                        Run
                    </button>
                    <button
                        className="bg-[#424242] text-white px-4 py-[3px] rounded hover:bg-[#606060] transition mx-2"
                        onClick={() => setTerminalOutput([])}>
                        Clear
                    </button>
                    <button
                        className="text-white p-1 rounded hover:bg-[#5e5e5e] bg-[#424242] transition"
                        onClick={() => setIsExpanded(!isExpanded)}>
                        {isExpanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                    </button>
                </div>
            </div>

            <div className="output">
                {terminalOutput.map((line, index) => (
                    <pre key={index} className="text-sm whitespace-pre-wrap break-words">{line}</pre>
                ))}
            </div>
        </div>
    );
};

export default Terminal;