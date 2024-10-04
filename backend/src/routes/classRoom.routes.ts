import express from "express";
import { Request, Response } from "express";
import {
  Exercise,
  LearningModule,
  Lesson,
} from "../models/learning_module.model";
import Classroom from "../models/classroom.model";
import User from "../models/user.model";
import { AuthenticatedRequest } from "./auth.routes";
import jwt, { JwtPayload } from "jsonwebtoken";
import { calculateStudentProgress } from "./performanceRecords.routes";
import verify from "./verifyToken";

const router = express.Router();

// Create a classroom
router.post("/createClassroom", async (req, res) => {
  try {
    const {
      teacher_id,
      learning_modules, // Array of learning module Codes
      classroom_name,
    } = req.body;

    // Making a 6 digit otp type classroom code, ensuring it is unique
    let classroom_code;
    let isUnique = false;

    while (!isUnique) {
      classroom_code = Math.floor(100000 + Math.random() * 900000);
      const existingClassroom = await Classroom.findOne({ classroom_code });
      if (!existingClassroom) {
        isUnique = true;
      }
    }

    const classroom = new Classroom({
      teacher_id,
      learning_modules,
      classroom_name,
      classroom_code,
    });

    await classroom.save();
    return res.status(201).json(classroom);
  } catch (error) {
    return res.status(500).json({ error: "Error creating classroom" });
  }
});

// Get all classrooms
router.get("/classrooms", async (req, res) => {
  try {
    const classrooms = await Classroom.find();
    return res.status(200).json(classrooms);
  } catch (error) {
    return res.status(500).json({ error: "Error fetching classrooms" });
  }
});

// Get a classroom by classroom code
router.get("/classrooms/:classroomCode", async (req, res) => {
  try {
    const classroom = await Classroom.findOne({
      classroom_code: req.params.classroomCode,
    }).lean();

    // If the classroom exists, manually populate the learning_modules by moduleCode
    if (classroom) {
      classroom.learning_modules = await LearningModule.find({
        moduleCode: { $in: classroom.learning_modules }, // Match moduleCode
      });

      // Also, populate today's lesson if it exists
      if (classroom.today_lesson) {
        classroom.today_lesson = await LearningModule.findOne({
          moduleCode: classroom.today_lesson,
        });
      }

      // Also, populate learning progress for each learning module
    }

    if (!classroom) {
      return res.status(404).json({ error: "Classroom not found" });
    }

    return res.status(200).json(classroom);
  } catch (error) {
    return res.status(500).json({ error: "Error fetching classroom:" + error });
  }
});

// Get a classroom by classroom code with progress details
router.get(
  "/classroomsProgress/:classroomCode",
  verify,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const studentId = (req.user as JwtPayload)._id;
      console.log("Student ID:");
      console.log(studentId);

      const classroom = await Classroom.findOne({
        classroom_code: req.params.classroomCode,
      }).lean();

      let tempClassroom: any = { ...classroom, progressInfo: [] };


      // If the classroom exists, manually populate the learning_modules by moduleCode
      if (classroom) {
        const progress = [];
        for (const module of classroom.learning_modules) {
          let studentProgress = await calculateStudentProgress(
            studentId,
            module
          );
          if (studentProgress.length == 0) {
            studentProgress = [
              {
                totalTasks: 0,
                completedTasks: 0,
                progressPercentage: 0,
                completedLessons: [],
                completedExercises: [],
                moduleCode: module,
              },
            ];
          }
          progress.push(studentProgress[0]);
        }
        classroom.learning_modules = await LearningModule.find({
          moduleCode: { $in: classroom.learning_modules }, // Match moduleCode
        });

        // Also, populate today's lesson if it exists
        if (classroom.today_lesson) {
          classroom.today_lesson = await LearningModule.findOne({
            moduleCode: classroom.today_lesson,
          });
        }
        tempClassroom = { ...classroom, progress };
      }

      if (!classroom) {
        return res.status(404).json({ error: "Classroom not found" });
      }

      return res.status(200).json(tempClassroom);
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Error fetching classroom:" + error });
    }
  }
);


// Example response
// {
//     "_id": "66f785f8ff0474587f931da6",
//     "students_enrolled": [
//         "66f7888d79b8e4b0aadf87f0",
//         "66f62b40d491b2f9cd1cd60b",
//         "66f7c4197879fb54cb05570e",
//         "66f7c7c37879fb54cb055735"
//     ],
//     "teacher_id": "66f78572ab172e4d0c216b50",
//     "learning_modules": [
//         {
//             "_id": "66f7870f79b8e4b0aadf87e9",
//             "name": "🧑‍🍳 Cooking",
//             "description": "Learn about cooking",
//             "difficulty": "easy",
//             "skills": [
//                 "vocab",
//                 "grammer"
//             ],
//             "related_modules": [],
//             "prerequisites": [],
//             "lessons": [
//                 "0001L0001",
//                 "0001L0002"
//             ],
//             "exercises": [],
//             "isPremium": false,
//             "moduleCode": "0001",
//             "createdAt": "2024-09-28T04:33:19.850Z",
//             "updatedAt": "2024-09-28T04:33:19.850Z",
//             "__v": 0
//         },
//         {
//             "_id": "66f7875479b8e4b0aadf87eb",
//             "name": "🧑‍🦰 Was and Were",
//             "description": "Learn about was and were ",
//             "difficulty": "easy",
//             "skills": [
//                 "vocab",
//                 "grammer"
//             ],
//             "related_modules": [],
//             "prerequisites": [],
//             "lessons": [],
//             "exercises": [],
//             "isPremium": false,
//             "moduleCode": "0002",
//             "createdAt": "2024-09-28T04:34:28.274Z",
//             "updatedAt": "2024-09-28T04:34:28.274Z",
//             "__v": 0
//         },
//         {
//             "_id": "66f7876e79b8e4b0aadf87ed",
//             "name": "🫏 Animals",
//             "description": "Learn about Animals",
//             "difficulty": "easy",
//             "skills": [
//                 "vocab",
//                 "grammer"
//             ],
//             "related_modules": [],
//             "prerequisites": [],
//             "lessons": [],
//             "exercises": [],
//             "isPremium": false,
//             "moduleCode": "0003",
//             "createdAt": "2024-09-28T04:34:54.252Z",
//             "updatedAt": "2024-09-28T04:34:54.252Z",
//             "__v": 0
//         }
//     ],
//     "is_game_active": true,
//     "performance_records": [],
//     "classroom_name": "Dummy",
//     "classroom_code": "865703",
//     "extra_points_award": [],
//     "createdAt": "2024-09-28T04:28:40.765Z",
//     "updatedAt": "2024-10-03T07:03:05.727Z",
//     "__v": 11,
//     "today_lesson": {
//         "_id": "66f7870f79b8e4b0aadf87e9",
//         "name": "🧑‍🍳 Cooking",
//         "description": "Learn about cooking",
//         "difficulty": "easy",
//         "skills": [
//             "vocab",
//             "grammer"
//         ],
//         "related_modules": [],
//         "prerequisites": [],
//         "lessons": [
//             "0001L0001",
//             "0001L0002"
//         ],
//         "exercises": [],
//         "isPremium": false,
//         "moduleCode": "0001",
//         "createdAt": "2024-09-28T04:33:19.850Z",
//         "updatedAt": "2024-09-28T04:33:19.850Z",
//         "__v": 0
//     },
//     "announcement": "🍰 Yay! Let's finish Unit 1 Cooking today. No class tommorow",
//     "progress": [
//         {
//             "totalTasks": 2,
//             "completedTasks": 2,
//             "completedLessons": [
//                 "0001L0001",
//                 "0001L0002"
//             ],
//             "completedExercises": [],
//             "moduleCode": "0001",
//             "progressPercentage": 100
//         },
//         {
//             "totalTasks": 0,
//             "completedTasks": 0,
//             "progressPercentage": 0,
//             "completedLessons": [],
//             "completedExercises": [],
//             "moduleCode": "0002"
//         },
//         {
//             "totalTasks": 0,
//             "completedTasks": 0,
//             "progressPercentage": 0,
//             "completedLessons": [],
//             "completedExercises": [],
//             "moduleCode": "0003"
//         }
//     ]
// }








// Add student to classroom
router.put("/addStudentToClassroom", async (req, res) => {
  try {
    const { classroom_code, student_id } = req.body;
    const classroom = await Classroom.findOne({
      classroom_code: classroom_code,
    });

    const user = await User.findById(student_id);
    if (!user) {
      return res.status(404).json({ error: "Student not found" });
    }

    if (!classroom) {
      return res.status(404).json({ error: "Classroom not found" });
    }

    classroom.students_enrolled.push(student_id);
    user.student_details
      ? (user.student_details.classroom_code = classroom_code)
      : (user.student_details = { classroom_code, game_points: 0 });
    await classroom.save();
    await user.save();
    return res.status(200).json(classroom);
  } catch (error) {
    return res.status(500).json({ error: "Error adding student to classroom" });
  }
});

// Remove student from classroom
router.put("/removeStudentFromClassroom", async (req, res) => {
  try {
    const { classroom_code, student_id } = req.body;

    const classroom = await Classroom.findOne({ classroom_code });

    if (!classroom) {
      return res.status(404).json({ error: "Classroom not found" });
    }

    classroom.students_enrolled = classroom.students_enrolled.filter(
      (id) => id !== student_id
    );
    await classroom.save();
    return res.status(200).json(classroom);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Error removing student from classroom" });
  }
});

// Add learning module to classroom
router.put("/addLearningModuleToClassroom", async (req, res) => {
  try {
    const { classroom_code, module_code } = req.body;

    const classroom = await Classroom.findOne({ classroom_code });

    if (!classroom) {
      return res.status(404).json({ error: "Classroom not found" });
    }

    classroom.learning_modules.push(module_code);
    await classroom.save();
    return res.status(200).json(classroom);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Error adding learning module to classroom" });
  }
});

// Remove learning module from classroom
router.put("/removeLearningModuleFromClassroom", async (req, res) => {
  try {
    const { classroom_code, module_code } = req.body;

    const classroom = await Classroom.findOne({ classroom_code });

    if (!classroom) {
      return res.status(404).json({ error: "Classroom not found" });
    }

    classroom.learning_modules = classroom.learning_modules.filter(
      (code) => code !== module_code
    );
    await classroom.save();
    return res.status(200).json(classroom);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Error removing learning module from classroom" });
  }
});

// Set today's lesson for classroom
router.put("/setTodaysLesson", async (req, res) => {
  try {
    const { classroom_code, module_code } = req.body;

    const classroom = await Classroom.findOne({ classroom_code });

    if (!classroom) {
      return res.status(404).json({ error: "Classroom not found" });
    }

    classroom.today_lesson = module_code;
    await classroom.save();
    return res.status(200).json(classroom);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Error setting today's lesson for classroom" });
  }
});

// Set game restriction period for classroom
router.put("/setGameRestrictionPeriod", async (req, res) => {
  try {
    const { classroom_code, start, end } = req.body;

    const classroom = await Classroom.findOne({ classroom_code });

    if (!classroom) {
      return res.status(404).json({ error: "Classroom not found" });
    }

    classroom.game_restriction_period = { start, end };
    await classroom.save();
    return res.status(200).json(classroom);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Error setting game restriction period for classroom" });
  }
});

// Activate or deactivate game for classroom
router.put("/setGameActivity", async (req, res) => {
  try {
    const { classroom_code, is_game_active } = req.body;

    const classroom = await Classroom.findOne({ classroom_code });

    if (!classroom) {
      return res.status(404).json({ error: "Classroom not found" });
    }

    classroom.is_game_active = is_game_active;
    await classroom.save();
    return res.status(200).json(classroom);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Error setting game activity for classroom" });
  }
});

// Award extra points to student
router.put("/awardExtraPoints", async (req, res) => {
  try {
    const { classroom_code, student_id, points, reason } = req.body;

    const classroom = await Classroom.findOne({ classroom_code });

    if (!classroom) {
      return res.status(404).json({ error: "Classroom not found" });
    }

    classroom.extra_points_award.push({ student_id, points, reason });
    await classroom.save();
    return res.status(200).json(classroom);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Error awarding extra points to student" });
  }
});

// Update class announcement
router.put("/updateClassAnnouncement", async (req, res) => {
  try {
    const { classroom_code, announcement } = req.body;

    const classroom = await Classroom.findOne({ classroom_code });

    if (!classroom) {
      return res.status(404).json({ error: "Classroom not found" });
    }

    classroom.announcement = announcement;
    await classroom.save();
    return res.status(200).json(classroom);
  } catch (error) {
    return res.status(500).json({ error: "Error updating class announcement" });
  }
});

export default router;
