import axiosInstance from './axiosInstance';
import { Question } from '../interfaces/Question';

export const questionService = {
    /**
     * List questions without pagination
     * Aligned with GET /api/questions
     */
    getQuestions: async () => {
        const response = await axiosInstance.get('/questions');
        return response.data; // Expecting { success: true, data: [...] }
    },

    /**
     * Create question
     * Aligned with POST /api/questions
     */
    addQuestion: async (data: Question) => {
        return axiosInstance.post('/questions', data);
    },

    // Add this method for updating existing questions
    updateQuestion: async (id: number, data: Question) => {
        return axiosInstance.put(`/questions/${id}`, data);
    },

    /**
     * Soft delete question
     * Aligned with DELETE /api/questions/{id}
     */
    deleteQuestion: async (id: number) => {
        return axiosInstance.delete(`/questions/${id}`);
    }
};