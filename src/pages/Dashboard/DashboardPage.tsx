import React from 'react';
import {
  IonGrid, IonRow, IonCol,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonSpinner
} from '@ionic/react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { dashboardService } from '../../api/dashboardService';

// ---------- API response types ----------
interface TotalTicketsSummary {
  count: number;
  last_30_days_count: number;
}

interface ActiveCustomersSummary {
  count: number;
  growth_percentage_from_last_month: number;
  current_month_count: number;
  previous_month_count: number;
}

interface ActiveProjectsSummary {
  count: number;
  near_completion_count: number;
}

interface NewLeadsSummary {
  count: number;
  growth_percentage_this_week: number;
  current_week_count: number;
  previous_week_count: number;
}

interface OverviewSummary {
  total_tickets: TotalTicketsSummary;
  active_customers: ActiveCustomersSummary;
  active_projects: ActiveProjectsSummary;
  new_leads: NewLeadsSummary;
}

interface TicketStatusItem {
  ticket_status_id: number;
  status_name: string;
  count: number;
}

interface CustomerTypeItem {
  customer_type_id: number;
  customer_type_name: string;
  count: number;
}

interface ProjectStatusItem {
  status: string;
  label: string;
  count: number;
}

interface LeadPipelineItem {
  lead_status_id: number;
  status_name: string;
  count: number;
}

interface OverviewCharts {
  ticket_status_distribution: TicketStatusItem[];
  customer_growth_by_type: CustomerTypeItem[];
  project_portfolio_status: ProjectStatusItem[];
  leads_sales_pipeline: LeadPipelineItem[];
}

interface GeneralOverviewData {
  summary: OverviewSummary;
  charts: OverviewCharts;
}

interface GeneralOverviewResponse {
  success: boolean;
  data: GeneralOverviewData;
}
// ----------------------------------------

interface DashboardPageProps {
  user: { name: string; email: string };
  notificationCount: number;
}

const TICKET_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

const DashboardPage: React.FC<DashboardPageProps> = ({ user }) => {
  const [isMounted, setIsMounted] = React.useState(false);
  const [overview, setOverview] = React.useState<GeneralOverviewData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  React.useEffect(() => {
    const fetchOverview = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response: GeneralOverviewResponse = await dashboardService.getGeneralOverView();
        if (response?.success && response?.data) {
          setOverview(response.data);
        }
      } catch (err: any) {
        setError(err?.response?.data?.message ?? 'Failed to load dashboard overview.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOverview();
  }, []);

  // --- Stat card values ---
  const summary = overview?.summary;
  const totalTickets   = summary?.total_tickets.count                          ?? '—';
  const last30Days     = summary?.total_tickets.last_30_days_count             ?? null;
  const activeCustomers = summary?.active_customers.count                      ?? '—';
  const customerGrowth  = summary?.active_customers.growth_percentage_from_last_month ?? null;
  const activeProjects  = summary?.active_projects.count                       ?? '—';
  const nearCompletion  = summary?.active_projects.near_completion_count       ?? '—';
  const newLeads        = summary?.new_leads.count                             ?? '—';
  const leadGrowth      = summary?.new_leads.growth_percentage_this_week       ?? null;

  // --- Chart data (mapped to match chart dataKey props) ---
  const ticketStats = (overview?.charts.ticket_status_distribution ?? []).map((item, index) => ({
    name:  item.status_name,
    value: item.count,
    color: TICKET_COLORS[index % TICKET_COLORS.length],
  }));

  // XAxis dataKey="type"
  const customerStats = (overview?.charts.customer_growth_by_type ?? []).map((item) => ({
    type:  item.customer_type_name,
    count: item.count,
  }));

  // XAxis dataKey="label"
  const projectStats = overview?.charts.project_portfolio_status ?? [];

  // YAxis dataKey="stage", Bar dataKey="total"
  const leadStats = (overview?.charts.leads_sales_pipeline ?? []).map((item) => ({
    stage: item.status_name,
    total: item.count,
  }));

  return (
    <>
      <div className="dashboard-view-wrapper">
        <div className="dashboard-intro">
          <h1>General Overview</h1>
          <p>Welcome back, {user.name}. Here is what's happening today.</p>
        </div>

        {isLoading && (
          <div className="dashboard-loading">
            <IonSpinner name="crescent" />
            <span>Loading overview...</span>
          </div>
        )}

        {!isLoading && error && (
          <div className="dashboard-error">
            <p>{error}</p>
          </div>
        )}

        {!isLoading && (
          <IonGrid className="ion-no-padding">
            {/* Stat Cards */}
            <IonRow>
              <IonCol size="12" sizeSm="6" sizeMd="3">
                <div className="stat-card border-blue">
                  <h3>Total Tickets</h3>
                  <p className="stat-number">{totalTickets}</p>
                  <span className="stat-label">
                    {last30Days !== null ? `${last30Days} in last 30 days` : 'Last 30 days'}
                  </span>
                </div>
              </IonCol>
              <IonCol size="12" sizeSm="6" sizeMd="3">
                <div className="stat-card border-green">
                  <h3>Active Customers</h3>
                  <p className="stat-number">{activeCustomers}</p>
                  <span className="stat-label">
                    {customerGrowth !== null ? `+${customerGrowth}% from last month` : 'No change data'}
                  </span>
                </div>
              </IonCol>
              <IonCol size="12" sizeSm="6" sizeMd="3">
                <div className="stat-card border-violet">
                  <h3>Active Projects</h3>
                  <p className="stat-number">{activeProjects}</p>
                  <span className="stat-label">{nearCompletion} Near Completion</span>
                </div>
              </IonCol>
              <IonCol size="12" sizeSm="6" sizeMd="3">
                <div className="stat-card border-indigo">
                  <h3>New Leads</h3>
                  <p className="stat-number">{newLeads}</p>
                  <span className="stat-label">
                    {leadGrowth !== null ? `+${leadGrowth}% this week` : 'No change data'}
                  </span>
                </div>
              </IonCol>
            </IonRow>

            {/* Charts */}
            <IonRow className="ion-margin-top">
              {/* Ticket Status Distribution — Donut */}
              <IonCol size="12" sizeLg="6">
                <IonCard className="chart-card">
                  <IonCardHeader>
                    <IonCardTitle>Ticket Status Distribution</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <div className="h-300">
                      {isMounted && (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={ticketStats}
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {ticketStats.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                            />
                            <Legend verticalAlign="bottom" />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              {/* Customer Growth by Type — Bar */}
              <IonCol size="12" sizeLg="6">
                <IonCard className="chart-card">
                  <IonCardHeader>
                    <IonCardTitle>Customer Growth by Type</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <div className="h-300">
                      {isMounted && (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={customerStats} margin={{ bottom: 40 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis
                              dataKey="type"
                              axisLine={false}
                              tickLine={false}
                              interval={0}
                              angle={-35}
                              textAnchor="end"
                              tick={{ fill: '#64748b', fontSize: 11 }}
                            />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                            <Tooltip cursor={{ fill: '#f1f5f9' }} />
                            <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={28} />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              {/* Projects Portfolio Status — Area */}
              <IonCol size="12" sizeLg="6">
                <IonCard className="chart-card">
                  <IonCardHeader>
                    <IonCardTitle>Projects Portfolio Status</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <div className="h-300">
                      {isMounted && (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={projectStats}>
                            <defs>
                              <linearGradient id="colorProject" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="label" axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip />
                            <Area type="monotone" dataKey="count" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorProject)" strokeWidth={3} />
                          </AreaChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              {/* Leads Sales Pipeline — Horizontal Bar */}
              <IonCol size="12" sizeLg="6">
                <IonCard className="chart-card">
                  <IonCardHeader>
                    <IonCardTitle>Leads Sales Pipeline</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <div className="h-300">
                      {isMounted && (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={leadStats} layout="vertical" margin={{ left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                            <XAxis type="number" hide />
                            <YAxis
                              dataKey="stage"
                              type="category"
                              axisLine={false}
                              tickLine={false}
                              tick={{ fill: '#475569', fontWeight: 600 }}
                            />
                            <Tooltip cursor={{ fill: 'transparent' }} />
                            <Bar dataKey="total" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={25} />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>
        )}
      </div>
    </>
  );
};

export default DashboardPage;
