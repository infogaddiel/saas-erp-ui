export interface Question {
    id?: number;
    question: string;         // Matches DataTypes.TEXT
    type?: string | null;     // Matches DataTypes.STRING(255)
    is_deleted?: boolean;     // Matches DataTypes.BOOLEAN
}