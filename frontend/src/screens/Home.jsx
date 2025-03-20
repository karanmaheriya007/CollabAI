import React, { useEffect, useState } from 'react';
import { useUser } from '../context/user.context'; // Import the custom hook
import axios from '../config/axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion'; // For animations
import { IoSunny } from "react-icons/io5";
import { CopilotPopup } from '@copilotkit/react-ui';

const Home = () => {
  const { user } = useUser(); // Use the custom hook
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projects, setProjects] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(true); // Dark mode state

  const navigate = useNavigate();

  // Toggle dark/light mode
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Create a new project
  const createProject = (e) => {
    e.preventDefault();
    axios.post('projects/create', { name: projectName })
      .then((res) => {
        setIsModalOpen(false);
        setProjectName('');
        fetchProjects(); // Refresh the project list
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // Fetch all projects
  const fetchProjects = () => {
    axios.get('/projects/all')
      .then((res) => {
        setProjects(res.data.projects);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#180227] text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* Navbar */}
      <nav className={`p-4 px-7 flex justify-between items-center ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow-md'}`}>
        <h1 className="text-2xl font-bold">CollabAI</h1>
        <div className="flex items-center gap-4">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
          >
            {isDarkMode ? <i className="fa-solid fa-moon px-[6px]"></i> : <IoSunny size={22} />}
          </button>
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-1"
          >
            Logout
          </button>
          <button
            onClick={() => navigate('/register')}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Signup
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* New Project Card */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            className={`p-6 rounded-lg shadow-lg cursor-pointer flex items-center justify-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
            onClick={() => setIsModalOpen(true)}
          >
            <div className="text-center">
              <i className="ri-add-line text-4xl text-blue-500"></i>
              <p className="mt-2 text-lg font-semibold">New Project</p>
            </div>
          </motion.div>

          {/* Project Cards */}
          {projects.map((project) => (
            <motion.div
              key={project._id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              className={`p-6 min-h-[124px] rounded-lg shadow-lg cursor-pointer ${isDarkMode ? 'bg-gray-800 hover:' : 'bg-white'}`}
              onClick={() => { navigate(`/project/${project._id}`, { state: { project } }) }}
            >
              <div>
                <h3 className="text-xl font-bold">{project.name}</h3>
                <p className="mt-2 text-gray-400">
                  <i className="ri-group-line mr-2"></i>
                  Collaborators: {project.users.length}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Modal for Creating New Project */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-6 rounded-lg shadow-lg w-11/12 md:w-1/3 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
          >
            <h2 className="text-xl font-bold mb-4">Create New Project</h2>
            <form onSubmit={createProject}>
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2" htmlFor="projectName">
                  Project Name
                </label>
                <input
                  onChange={(e) => setProjectName(e.target.value)}
                  value={projectName}
                  type="text"
                  id="projectName"
                  name="projectName"
                  className={`border rounded w-full py-2 px-3 leading-tight focus:ring-2 focus:ring-blue-500 outline-none ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`}
                  required
                />
              </div>
              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Create
                </button>
                <button
                  type="button"
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      <CopilotPopup
        instructions={`
        You are CollabAI Assistant. Your sole purpose is to assist users with using the CollabAI platform. 
        Do not generate unrelated responses, code, or external information.
        If a user asks something unrelated, politely redirect them back to CollabAI features.
        MOST IMPORTANT : please add numbers in front of steps

        user : How to use CollabAI not only AI ?
        assistant : Here are the steps to use CollabAI:
        **1.**Signup or Login to CollabAI.
        **2.**Create a new project.
        **3.**Click on the created project to open it.
        **4.**Click on the "Add Collaborators" button.
        **5.**Add your existing CollabAI friends to collaborate on the project.
        **6.**Check your Collaborators by clicking on the Users icon.
        **7.**Start chatting with your friends.
        **8.**Type @ai in your message to chat with AI.
        **9.**Generate code, components, and HTML pages.
        **10.**Click "Preview" to see your results.
        **11.**Click "Review" to enhance and debug your code.

        Let me know if you need more help! 🚀

        If a user asks something unrelated,
        user : create HTML button or Create function to add two numbers
        assistant : I'm here to assist with CollabAI features. Let me know if you need help with using the platform! Please use the CollabAI platform to generate code or components.

        user : What is your name ?
        assistant : I'm CollabAI Assistant. I am created by Karan Maheriya.
        `}
        labels={{
          title: "CollabAI Assistant",
          initial: "Need any help?",
        }}
      />

    </div>
  );
};

export default Home;