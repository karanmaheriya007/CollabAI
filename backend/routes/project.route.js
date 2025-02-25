import { Router } from "express";
import { body } from "express-validator";
import { createProjectController, getAllProject, addUserToProject, getProjectByIdController } from "../controllers/project.controller.js";
import { authUser } from "../middlewares/auth.middleware.js";
import { updateFileTree } from "../services/project.service.js";

const router = Router();

router.post('/create', authUser, body('name').isString().withMessage('Name is required'), createProjectController);

router.get('/all', authUser, getAllProject);

router.put('/add-user', authUser,
    body('projectId').isString().withMessage('Project ID is required').bail(),
    body('users').isArray({ min: 1 }).withMessage('Users must be an array of strings').bail().custom((users) => {
        return users.every(user => typeof user === 'string');
    }).withMessage('Each user must be a string'),
    addUserToProject
);

router.get('/get-project/:projectId', authUser, getProjectByIdController);

router.put('/update-file-tree',
    authUser,
    body('projectId').isString().withMessage('Project ID is required'),
    body('fileTree').isObject().withMessage('File tree is required'),
    updateFileTree
)

// DELETE /projects/delete/:id - Delete a project
// router.delete('/delete/:id', authUser, async (req, res) => {
//     try {
//       const project = await Project.findById(req.params.id);
  
//       if (!project) {
//         return res.status(404).json({ message: 'Project not found' });
//       }
  
//       // Check if the user is the owner of the project
//       if (project.user.toString() !== req.user.id) {
//         return res.status(403).json({ message: 'Not authorized to delete this project' });
//       }
  
//       await project.remove(); // Delete the project
//       res.json({ message: 'Project deleted successfully' });
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ message: 'Server error' });
//     }
//   });
  
//   // PUT /projects/update/:id - Update a project name
//   router.put('/update/:id', authUser, async (req, res) => {
//     try {
//       const project = await Project.findById(req.params.id);
  
//       if (!project) {
//         return res.status(404).json({ message: 'Project not found' });
//       }
  
//       // Check if the user is the owner of the project
//       if (project.user.toString() !== req.user.id) {
//         return res.status(403).json({ message: 'Not authorized to update this project' });
//       }
  
//       project.name = req.body.name; // Update the project name
//       await project.save(); // Save the updated project
//       res.json({ message: 'Project updated successfully', project });
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ message: 'Server error' });
//     }
//   });
  

export default router;