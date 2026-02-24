import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ticketService } from '../api/ticketService';
import { ServiceReportRequest } from '../interfaces/Ticket';
import { userService } from '../api/userService';

interface ReportState {
    services: ServiceReportRequest[];
    technicians: any[]; // To store users with Role 4
    currentReport: (ServiceReportRequest & {
        id: number;
        ticket_id: number;
        created_at: string;
        updated_at: string;
    }) | null;
    pagination: {
        total: number;
        totalPages: number;
        limit: number;
    };
    loading: boolean;
    error: string | null;
}

const initialState: ReportState = {
    services: [],
    technicians: [],
    currentReport: null,
    pagination: {
        total: 0,
        totalPages: 1,
        limit: 10
    },
    loading: false,
    error: null
};

// --- Thunks ---

export const fetchTechnicians = createAsyncThunk('reports/fetchTechnicians', async () => {
    const response = await userService.getUsersByRole(4);
    return response.data;
});

export const fetchReportById = createAsyncThunk(
    'reports/fetchById',
    async ({ ticketId, serviceId }: { ticketId: number, serviceId: number }) => {
        const response = await ticketService.getServiceReportById(ticketId, serviceId);
        return response.data;
    }
);

export const saveReportAction = createAsyncThunk(
    'reports/save',
    async ({ id, ticketId, payload, isEdit }: { id?: number, ticketId: number, payload: any, isEdit: boolean }, { rejectWithValue }) => {
        try {
            if (isEdit && id) {
                const response = await ticketService.updateServiceReport(ticketId, id, payload);
                return response.data;
            }
            const response = await ticketService.createServiceReport(ticketId, payload);
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.message || 'Failed to save report');
        }
    }
);

export const fetchReportsAction = createAsyncThunk(
    'reports/fetchAll',
    async (page: number, { rejectWithValue }) => {
        try {
            const response = await ticketService.getServiceReports(page, 10);
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.message || 'Failed to fetch');
        }
    }
);

// --- Slice ---

const reportSlice = createSlice({
    name: 'reports',
    initialState,
    reducers: {
        addReportToStore: (state, action: PayloadAction<any>) => {
            state.services = [action.payload, ...state.services];
        },
        clearCurrentReport: (state) => {
            state.currentReport = null;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch All Reports
            .addCase(fetchReportsAction.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchReportsAction.fulfilled, (state, action) => {
                state.loading = false;
                state.services = action.payload.services || [];
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchReportsAction.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Fetch Technicians
            .addCase(fetchTechnicians.fulfilled, (state, action) => {
                state.technicians = action.payload;
            })

            // Fetch Single Report (Edit Mode)
            .addCase(fetchReportById.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchReportById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentReport = action.payload ?? null;
            })
            .addCase(fetchReportById.rejected, (state, action) => {
                state.loading = false;
                state.error = "Could not load the specific report.";
            })

            // Save Report (Create/Update)
            .addCase(saveReportAction.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(saveReportAction.fulfilled, (state, action) => {
                state.loading = false;
                if (!action.payload) return;
                const savedReport = action.payload; // The report returned from API
                // Find if it already exists (Update) or is new (Create)
                const index = state.services.findIndex(s => s.id === savedReport.id);
                if (index !== -1) {
                    // Update existing report in the list
                    state.services[index] = {
                        ...state.services[index],
                        ...savedReport
                    };
                } else {
                    // Add new report to the top of the list
                    state.services.unshift(savedReport);
                }
            })
            .addCase(saveReportAction.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    }
});

export const { addReportToStore, clearCurrentReport } = reportSlice.actions;
export default reportSlice.reducer;