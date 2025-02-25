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

const Project1 = () => {
    const location = useLocation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [users, setUsers] = useState([]);
    const [fetchedProject, setFetchedProject] = useState(location.state.project);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]); // State to store all messages
    const { user } = useContext(UserContext);
    const messageBox = React.createRef();

    const [fileTree, setFileTree] = useState({});

    const [currentFile, setCurrentFile] = useState(null);
    const [openFiles, setOpenFiles] = useState([]);
    // const [webContainer, setWebContainer] = useState(null);
    // const [iframeUrl, setIframeUrl] = useState(null)
    // const [runProcess, setRunProcess] = useState(null)

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

        // if (!webContainer) {
        //     getWebContainer().then((container) => {
        //         setWebContainer(container);
        //         console.log('container started');
        //     });
        // }

        receiveMessage('project-message', (data) => {
            try {
                console.log('Raw message:', data); // Log the raw message
                let message;
                try {
                    message = JSON.parse(data.message); // Attempt to parse as JSON
                } catch (e) {
                    message = data.message; // Fallback to raw message if parsing fails
                }
                // The .mount() method is used to load a file structure (fileTree) into WebContainer's virtual filesystem.
                // webContainer?.mount(message.fileTree);
                // Ensure timestamp is set for AI messages
                if (data.sender._id === 'ai') {
                    data.timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                }
                if (message.fileTree) {
                    setFileTree(message.fileTree);
                }
                setMessages((prevMessages) => [...prevMessages, data]); // Directly add the message to the state
            } catch (error) {
                console.error('Error handling message:', error);
            }
        });

        // Fetch project and users
        axios.get(`/projects/get-project/${location.state.project._id}`)
            .then((res) => {
                setFetchedProject(res.data.project);
                setFileTree(res.data.project.fileTree);
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
        sendMessage('project-message', newMessage); // Send the message via socket
        setMessages((prevMessages) => [...prevMessages, newMessage]); // Directly add the message to the state
        setMessage(''); // Clear the input field
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
            // If JSON parsing fails, display a user-friendly error message
            return (
                <div className="overflow-auto custom-scrollbar rounded p-2 bg-gray-900 text-white font-mono mb-4">
                    <p>Some issue in generating the result. So, Please ask again! 😊</p>
                </div>
            );
        }
    }

    // Scroll to the bottom of the message box whenever messages are updated
    useEffect(() => {
        if (messageBox.current) {
            messageBox.current.scrollTop = messageBox.current.scrollHeight;
        }
    }, [messageBox]);

    return (
        <main className="h-screen w-screen flex text-sm">
            <section className="left flex flex-col h-full w-80 min-w-80 border-r">
                <header className='flex justify-between px-3 py-3 w-full border-b'>
                    <button className='add-user flex items-center gap-3 hover:bg-gray-100 px-3 rounded-md py-1 transition duration-200 -ml-1' onClick={() => setIsModalOpen(true)}>
                        <i className="fa-solid fa-user-plus"></i>
                        <p className='font-semibold pb-[1px]'>Add collaborator</p>
                    </button>
                    <button onClick={() => setIsSidePanelOpen(!isSidePanelOpen)} className="py-1 px-2 hover:bg-gray-200 rounded-full transition duration-200">
                        <i className="ri-group-fill text-base"></i>
                    </button>
                </header>
                <div className="conversation-area flex flex-grow flex-col overflow-hidden">
                    <div ref={messageBox} className="message-box flex-grow bg-[url('/src/assets/images/message-background2.jpg')] bg-cover bg-center flex flex-col p-4 space-y-2 overflow-auto custom-scrollbar">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`${msg.sender._id === user._id
                                    ? 'self-end bg-[#D9FDD3] w-[80%]' // Outgoing message
                                    : msg.sender._id === 'ai'
                                        ? 'self-start bg-white w-full' // AI message with full width
                                        : 'self-start bg-white w-[80%]' // Incoming message from other users
                                    } break-words text-gray-800 px-4 pt-2 pb-3 rounded-lg shadow-md relative`}
                            >
                                <small className={`text-gray-500 block text-xs ${msg.sender._id === 'ai' ? 'pb-2' : ''}`}>{msg.sender.email}</small>
                                {msg.sender._id === 'ai' ? (
                                    WriteAiMessage(msg.message)
                                ) : (
                                    <p className="pb-3 text-sm">{msg.message}</p>
                                )}
                                <span className="text-gray-400 text-[10px] absolute bottom-1 right-2">{msg.timestamp}</span>
                                <div
                                    className={`absolute ${msg.sender._id === user._id ? '-right-2 top-0 w-5 h-5 bg-[#D9FDD3]' : '-left-2 top-0 w-5 h-5 bg-white'}`}
                                    style={{ clipPath: msg.sender._id === user._id ? 'polygon(100% 0, 0 0, 0 100%)' : 'polygon(100% 0, 0 0, 99% 100%)' }}
                                ></div>
                            </div>
                        ))}
                    </div>
                    <div className="inputField w-full flex bg-white py-2 border-t">
                        <input
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && message.trim()) {
                                    send();
                                }
                            }}
                            className='px-4 w-full border-none outline-none text-sm' type="text" placeholder='Type a message'
                        />
                        <button onClick={send} disabled={!message.trim()} className='mr-1 p-2 hover:bg-slate-200 rounded-md text-gray-700 cursor-pointer'><VscSend size={20} /></button>
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
                                {users.map((user) => (
                                    <div
                                        key={user._id}
                                        onClick={() => toggleUserSelection(user._id)}
                                        className={`flex justify-between items-center p-2 px-3 rounded cursor-pointer mr-3 transition duration-200 ${selectedUsers.includes(user._id) ? "bg-blue-50" : "hover:bg-gray-100"
                                            }`}
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
                            <button onClick={addCollaborators} className='bg-blue-500 text-white font-semibold p-2 px-3 rounded-md mt-5 block mx-auto'>Add Collaborators</button>
                        </div>
                    </div>
                )}
            </section>
            <section className="right bg-[#1e1e1e] h-full w-full flex">
                <div className="explorer h-full min-w-56 bg-[#1e1e1e] border-r border-[#676767]">
                    <div className="file-tree">
                        {fileTree && Object.keys(fileTree).map((file, index) => (
                            <div key={index} className="tree-element cursor-pointer" onClick={() => {
                                setCurrentFile(file);
                                setOpenFiles([...new Set([...openFiles, file])]);
                            }}>
                                <p className="bg-[#1e1e1e] text-white px-2 hover:bg-[#2c2c2c] py-2 border-b border-[#676767]">{file}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="code-editor flex-grow flex h-full flex-col">
                    <div className="top justify-between w-full border-b border-[#676767]">
                        <div className="files flex">
                            {
                                openFiles.map((file, index) => (
                                    <div
                                        key={index}
                                        onClick={() => setCurrentFile(file)}
                                        className={`open-file border-r border-[#676767] text-white cursor-pointer py-2 px-3 flex items-center w-fit gap-2 ${currentFile === file ? 'bg-[#1E1E1E]' : 'bg-[#3b3b3b]'}`}>
                                        <p className='font-normal'>{file}</p>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenFiles(openFiles.filter(f => f !== file));
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
                </div>
            </section>
        </main>
    );
};

export default Project1;