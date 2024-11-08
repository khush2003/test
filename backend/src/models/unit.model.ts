import type { Mixed, ObjectId } from "mongoose";
import mongoose, { Schema } from 'mongoose';


interface ILesson {
    title: string;
    description: string;
    instruction: string;
    lesson_type: string;
    lesson_content: Mixed[];
    order: number;
    image?: string;
}

interface IExercise {
    title: string;
    description: string;
    instruction: string;
    exercise_type: string;
    exercise_content: Mixed[];
    is_instant_scored: boolean;
    correct_answers: Mixed[];
    varients: ObjectId[];
    max_score: number;
    order: number;
    dropItems?: Mixed[];
    image?: string;
}

interface IUnit {
    name: string;
    description: string;
    difficulty: string;
    skills: string[];
    related_units: ObjectId[];
    prerequisites: ObjectId[];
    lessons: ILesson[];
    exercises: IExercise[];
    is_premium: boolean;
}

const LessonSchema = new Schema<ILesson>({
    title: { type: String, required: true },
    description: { type: String, required: true },
    instruction: { type: String, required: true },
    lesson_type: { type: String, enum: ["flashcard", "text", "image"] },
    lesson_content: { type: [Schema.Types.Mixed] },
    order: { type: Number, unique: true, required: true },
    image: { type: String }
}, { _id: true });

const ExerciseSchema = new Schema<IExercise>({
    title: { type: String, required: true },
    description: { type: String , required: true },
    instruction: { type: String, required: true },
    exercise_type: { type: String, enum: ["multiple_choice", "crossword_puzzle", "drag_and_drop", "fill_in_the_blanks", "images_with_input", "text_with_input", "text_with_questions"] },
    exercise_content: { type: [Schema.Types.Mixed] },
    is_instant_scored: { type: Boolean, default: false },
    correct_answers: { type: [Schema.Types.Mixed] },
    varients: [{ type: Schema.Types.ObjectId, ref: 'Exercise' }],
    max_score: { type: Number, required: true },
    order: { type: Number, unique: true, required: true },
    dropItems: { type: [Schema.Types.Mixed] },
    image: { type: String }
}, { _id: true });

const UnitSchema = new Schema<IUnit>({
    name: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], required: true },
    skills: { type: [String], required: true },
    related_units: [{ type: Schema.Types.ObjectId, ref: 'Unit' }],
    prerequisites: [{ type: Schema.Types.ObjectId, ref: 'Unit' }],
    lessons: [LessonSchema],
    exercises: [ExerciseSchema],
    is_premium: { type: Boolean, default: false, required: true }
});

// Create compound index for id and is_premium
UnitSchema.index({ _id: 1, is_premium: -1 });

export const Unit = mongoose.model<IUnit>('Unit', UnitSchema);
export {UnitSchema, LessonSchema, ExerciseSchema };
export type { IExercise, ILesson, IUnit };