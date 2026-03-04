export type ProjectStatus = 'Planning' | 'In-Progress' | 'On-Hold' | 'Completed' | 'Cancelled';
export interface ProjectDocument {
    id?: number,
    project_id?: number,
    document_name: string,
    document_url: string | null,
    document_type: string,
    notes: string

}
export interface Project {
    id?: number;
    project_name: string;
    customer_id: number | null;
    customer_name?: string;
    project_manager?: string;
    start_date: string | null; // Allow null here
    end_date: string | null;   // Allow null here
    budget: number;
    status: ProjectStatus;
    description?: string;
    notes?: string;
    customer?: {
        id: number;
        name: string;
    };
    documents?:ProjectDocument[];
}