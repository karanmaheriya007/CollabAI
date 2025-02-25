import React, { useState, useEffect, useContext, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { VscSend } from 'react-icons/vsc';
import { RxCross2 } from 'react-icons/rx';
import { FaUser } from 'react-icons/fa6';
import axios from '../config/axios';
import { initializeSocket, receiveMessage, sendMessage } from '../config/socket';
import { UserContext } from '../context/user.context';
import Markdown from 'markdown-to-jsx';
import MonacoEditor from '@monaco-editor/react';
import CodeRunner from './CodeRunner';
import Terminal from './Terminal';

const Project = () => {
    const location = useLocation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [users, setUsers] = useState([]);
    const [fetchedProject, setFetchedProject] = useState(location.state.project);
    const [message, setMessage] = useState('');
    // const [messages, setMessages] = useState([]);

    const { user } = useContext(UserContext);
    const messageBox = React.createRef();

    // const [fileTree, setFileTree] = useState({});
    const [currentFile, setCurrentFile] = useState(null);
    const [openFiles, setOpenFiles] = useState([]);
    // const [iframeCode, setIframeCode] = useState('');
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    // Retrieve messages and fileTree from localStorage safely
    const [messages, setMessages] = useState(() => {
        try {
            const storedMessages = localStorage.getItem('messages');
            return storedMessages ? JSON.parse(storedMessages) : [];
        } catch (error) {
            console.error("Error parsing messages from localStorage:", error);
            return [];
        }
    });

    // Initialize fileTree from localStorage or fetchedProject
    const [fileTree, setFileTree] = useState(() => {
        try {
            const storedFileTree = localStorage.getItem('fileTree');
            if (storedFileTree) {
                return JSON.parse(storedFileTree);
            }
        } catch (error) {
            console.error("Error parsing fileTree from localStorage:", error);
        }
        // Fallback to fileTree from fetchedProject or empty object
        return location.state.project?.fileTree || {};
    });

    // Save messages to localStorage whenever they change
    useEffect(() => {
        try {
            localStorage.setItem('messages', JSON.stringify(messages));
        } catch (error) {
            console.error("Error saving messages to localStorage:", error);
        }
    }, [messages]);

    // Save fileTree to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem('fileTree', JSON.stringify(fileTree));
        } catch (error) {
            console.error("Error saving fileTree to localStorage:", error);
        }
    }, [fileTree]);


    const toggleUserSelection = (userId) => {
        setSelectedUsers((prevSelected) =>
            prevSelected.includes(userId) ? prevSelected.filter((id) => id !== userId) : [...prevSelected, userId]
        );
    };

    const addCollaborators = () => {
        axios.put('/projects/add-user', { projectId: location.state.project._id, users: selectedUsers })
            .then((res) => {
                setIsModalOpen(false);
            })
            .catch((err) => {
                console.log(err);
            });
    };

    useEffect(() => {
        initializeSocket(fetchedProject._id);

        receiveMessage('project-message', (data) => {
            try {
                console.log('Raw message:', data);
                let message;
                try {
                    message = JSON.parse(data.message);
                } catch (e) {
                    message = data.message;
                }

                if (data.sender._id === 'ai') {
                    data.timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                }

                // Merge the new fileTree with the existing fileTree
                if (message.fileTree) {
                    setFileTree((prevFileTree) => ({
                        ...prevFileTree, // Keep the existing fileTree
                        ...message.fileTree, // Merge with the new fileTree
                    }));
                }

                // Add the message to the messages list
                setMessages((prevMessages) => [...prevMessages, data]);
            } catch (error) {
                console.error('Error handling message:', error);
            }
        });

        axios.get(`/projects/get-project/${location.state.project._id}`)
            .then((res) => {
                setFetchedProject(res.data.project);
                setFileTree((prevFileTree) => {
                    if (Object.keys(prevFileTree).length === 0) {
                        return res.data.project.fileTree; // Only set if no fileTree exists
                    }
                    return prevFileTree; // Keep existing fileTree if available
                });
            })
            .catch((err) => {
                console.log(err);
            });

        axios.get('/users/all')
            .then((res) => {
                setUsers(res.data);
            })
            .catch((err) => {
                console.log(err);
            });
    }, [location.state.project._id, fetchedProject._id]);

    const send = () => {
        const newMessage = { message, sender: user, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
        sendMessage('project-message', newMessage);
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        setMessage('');
    };

    function WriteAiMessage(message) {
        try {
            const messageObject = JSON.parse(message);
            return (
                <div className="overflow-auto custom-scrollbar rounded p-2 bg-gray-900 text-white font-mono mb-4">
                    <Markdown>{messageObject.text}</Markdown>
                </div>
            );
        } catch (error) {
            return (
                <div className="overflow-auto custom-scrollbar rounded p-2 bg-gray-900 text-white font-mono mb-4">
                    <p>Some issue in generating the result. Please ask again!</p>
                </div>
            );
        }
    }

    useEffect(() => {
        if (messageBox.current) {
            messageBox.current.scrollTop = messageBox.current.scrollHeight;
        }
    }, [messageBox]);

    const deleteFile = (file) => {
        if (window.confirm(`Are you sure you want to delete ${file}?`)) {
            const updatedTree = { ...fileTree };
            delete updatedTree[file];
            setFileTree(updatedTree);
            setOpenFiles(openFiles.filter(f => f !== file));
            if (currentFile === file) {
                setCurrentFile(null);
            }
        }
    };

    return (
        <main className="h-screen w-screen flex text-sm overflow-hidden">
            <section className="left flex flex-col h-full w-96 min-w-96 border-r border-[#676767]">
                <header className='flex justify-between px-3 py-3 w-full border-b border-[#676767] bg-[#1e1e1e] text-white'>
                    <button className='add-user flex items-center gap-3 bg-[#424242] hover:bg-[#4f4f4f] px-3 rounded-md py-1 transition duration-200 -ml-1' onClick={() => setIsModalOpen(true)}>
                        <i className="fa-solid fa-user-plus"></i>
                        <p className='font-semibold pb-[1px] '>Add collaborators</p>
                    </button>
                    <button
                        onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
                        className="py-1 px-2 bg-[#424242] hover:bg-[#4f4f4f] rounded-full transition duration-200">
                        <i className="ri-group-fill text-base"></i>
                    </button>
                </header>
                <div className="conversation-area flex flex-grow flex-col overflow-hidden">
                    <div ref={messageBox} className="message-box flex-grow bg-[url('')] bg-[#151424] bg-cover bg-center flex flex-col p-4 space-y-2 overflow-auto custom-scrollbar">
                        {messages.map((msg, index) => (
                            <div key={index} className={`${msg.sender._id === user._id ? 'self-end bg-[#fff] w-[80%]' : msg.sender._id === 'ai' ? 'self-start bg-white w-full' : 'self-start bg-white w-[80%]'} break-words text-gray-800 px-4 pt-2 pb-3 rounded-lg shadow-md relative`}>
                                <small className={`text-gray-500 block text-xs ${msg.sender._id === 'ai' ? 'pb-2' : ''}`}>{msg.sender.email}</small>
                                {msg.sender._id === 'ai' ? WriteAiMessage(msg.message) : <p className="pb-3 text-sm">{msg.message}</p>}
                                <span className="text-gray-400 text-[10px] absolute bottom-1 right-2">{msg.timestamp}</span>
                                <div className={`absolute ${msg.sender._id === user._id ? '-right-2 top-0 w-5 h-5 bg-[#fff]' : '-left-2 top-0 w-5 h-5 bg-white'}`} style={{ clipPath: msg.sender._id === user._id ? 'polygon(100% 0, 0 0, 0 100%)' : 'polygon(100% 0, 0 0, 99% 100%)' }}></div>
                            </div>
                        ))}
                    </div>
                    <div className="inputField w-full flex bg-[#1e1e1e] py-2 border-t border-[#676767]">
                        <input value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && message.trim()) send(); }} className='caret-white text-white bg-[#1e1e1e] px-4 w-full border-none outline-none text-sm' type="text" placeholder='Type a message' />
                        <button onClick={send} disabled={!message.trim()} className='mr-1 p-2 bg-[#424242] hover:bg-[#4f4f4f] rounded-md text-white cursor-pointer'><VscSend size={20} /></button>
                    </div>
                </div>
                <div className={`side-panel absolute w-80 border-r h-screen transform transition-transform duration-300 ease-in-out ${isSidePanelOpen ? 'translate-x-0' : '-translate-x-full'} bg-white`}>
                    <header className="flex justify-between items-center p-4 bg-gray-600 text-white">
                        <h2 className='font-semibold'>Collaborators</h2>
                        <button onClick={() => setIsSidePanelOpen(false)} className='hover:bg-gray-500 p-1 rounded-md'><RxCross2 size={16} /></button>
                    </header>
                    {fetchedProject?.users && fetchedProject?.users.map((user, index) => (
                        <div key={user._id || index} className="collaborators p-2 flex flex-col gap-2">
                            <div className="w-full flex p-3 items-center gap-3 rounded cursor-pointer hover:bg-slate-100">
                                <div className="user-img bg-slate-300 p-2 rounded-full">
                                    <FaUser size={16} />
                                </div>
                                <p className='font-semibold'>{user.email}</p>
                            </div>
                        </div>
                    ))}
                </div>
                {/* Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white p-4 px-5 rounded shadow-lg w-96 relative">
                            <div className="flex justify-between mb-4">
                                <h2 className="font-semibold text-lg">Select Users</h2>
                                <button onClick={() => setIsModalOpen(false)} className='hover:bg-slate-200 px-2 rounded-md'><RxCross2 size={16} /></button>
                            </div>
                            <div className="flex flex-col gap-3 max-h-56 overflow-auto custom-scrollbar">
                                {users?.map((user) => (
                                    <div
                                        key={user._id}
                                        onClick={() => toggleUserSelection(user._id)}
                                        className={`flex justify-between items-center p-2 px-3 rounded cursor-pointer mr-3 transition duration-200 ${selectedUsers.includes(user._id) ? "bg-blue-50" : "hover:bg-gray-100"}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="user-img bg-slate-300 p-2 rounded-full">
                                                <FaUser size={16} />
                                            </div>
                                            <p className="font-semibold">{user.email}</p>
                                        </div>
                                        {selectedUsers.includes(user._id) && (
                                            <i className="fa-solid fa-circle-check text-green-500 text-base"></i>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={addCollaborators}
                                className='bg-blue-500 text-white font-semibold p-2 px-3 rounded-md mt-5 block mx-auto'>Add Collaborators</button>
                        </div>
                    </div>
                )}
            </section>
            <section className="right flex flex-col flex-grow">
                <div className="bg-[#1e1e1e] text-lg text-center font-bold text-white px-2 py-[14px]">
                    <p>CollabAI Code Editor</p>
                </div>
                <div className="bg-[#1e1e1e] h-full w-full flex">
                    <div className="explorer h-full w-52 bg-[#1e1e1e] border-r border-t border-[#676767]    ">
                        <div className="file-tree">
                            {fileTree && Object.keys(fileTree).map((file, index) => (
                                <div key={index} className="tree-element cursor-pointer" onClick={() => {
                                    setCurrentFile(file);
                                    setOpenFiles([...new Set([...openFiles, file])]);
                                }}>
                                    <p className="relative bg-[#1e1e1e] text-white px-2 hover:bg-[#2c2c2c] py-2 border-b border-[#676767]">{file}<button onClick={(e) => {
                                        e.stopPropagation();
                                        deleteFile(file);
                                    }} className='absolute right-2 top-2'>
                                        <i className="fa-solid fa-trash"></i>
                                    </button></p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="code-editor flex-grow flex h-full flex-col">
                        <div className="top justify-between w-full relative">
                            <div className={`files flex border-b ${openFiles.length > 0 ? 'border-t' : ''} border-[#676767]`}>
                                {
                                    openFiles
                                        .filter((file) => fileTree[file]) // Filter files that exist in the fileTree
                                        .map((file, index) => (
                                            <div
                                                key={index}
                                                onClick={() => setCurrentFile(file)}
                                                className={`open-file border-r border-[#676767] text-white cursor-pointer py-2 px-3 flex items-center w-fit gap-2 ${currentFile === file ? 'bg-[#1E1E1E]' : 'bg-[#3b3b3b]'}`}>
                                                <p className="font-normal">{file}</p>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setOpenFiles(openFiles.filter((f) => f !== file));
                                                        if (currentFile === file) {
                                                            setCurrentFile(openFiles.length > 1 ? openFiles[0] : null);
                                                        }
                                                    }}
                                                    className="pt-1 text-white hover:text-white"
                                                >
                                                    <RxCross2 size={14} />
                                                </button>
                                            </div>
                                        ))
                                }
                            </div>
                            <button
                                className="bg-[#424242] absolute right-1 top-[5px] text-white px-4 py-1 rounded hover:bg-[#606060] transition"
                                onClick={() => setIsPreviewOpen(true)}
                            >
                                Preview
                            </button>
                        </div>
                        <div className="bottom flex flex-grow bg-[#1E1E1E] pt-3 overflow-hidden">
                            {
                                currentFile && fileTree[currentFile] && (
                                    <MonacoEditor
                                        height="100%" // Make it fill the available space
                                        language="javascript" // You can change this based on the file type
                                        value={fileTree[currentFile]?.file?.contents}
                                        onChange={(newValue) => {
                                            const updatedFileTree = {
                                                ...fileTree,
                                                [currentFile]: {
                                                    ...fileTree[currentFile],  // Preserve other properties
                                                    file: {
                                                        ...fileTree[currentFile].file,  // Preserve other properties of file
                                                        contents: newValue,  // Update contents
                                                    },
                                                },
                                            };
                                            setFileTree(updatedFileTree);
                                        }}
                                        options={{
                                            selectOnLineNumbers: true,
                                            minimap: { enabled: false },
                                            lineNumbers: "on", // Show line numbers
                                            theme: "vs-dark", // VS Code-like dark theme
                                            fontSize: 14, // Font size
                                            wordWrap: "on", // Wrap text at the end of the line
                                        }}
                                    />
                                )}
                        </div>
                        {/* Terminal Section */}
                        <Terminal fileTree={fileTree} currentFile={currentFile}/>
                    </div>
                </div>
                {/* Iframe section for live preview */}
                {isPreviewOpen && (
                    <CodeRunner currentFile={currentFile} fileTree={fileTree} setIsPreviewOpen={setIsPreviewOpen} />
                )}
            </section>
        </main>
    );
};

export default Project;
