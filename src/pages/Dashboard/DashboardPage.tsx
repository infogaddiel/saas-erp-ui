import React from 'react';
import {
  IonContent, IonPage, IonGrid, IonRow, IonCol,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent
} from '@ionic/react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import Header from '../../components/Header';

interface DashboardPageProps {
  user: { name: string; email: string };
  notificationCount: number;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ user, notificationCount }) => {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);
  // Mock Data for Charts
  const ticketStats = [
    { name: 'Open', value: 12, color: '#3b82f6' },
    { name: 'In Progress', value: 18, color: '#8b5cf6' },
    { name: 'Resolved', value: 45, color: '#10b981' },
    { name: 'On Hold', value: 5, color: '#f59e0b' },
  ];

  const customerStats = [
    { type: 'Corporate', count: 45 },
    { type: 'Retail', count: 120 },
    { type: 'Partner', count: 30 },
    { type: 'Direct', count: 85 },
  ];

  // NEW: Projects by Status (Area Chart for visual weight)
  const projectStats = [
    { status: 'Planning', count: 5 },
    { status: 'Active', count: 14 },
    { status: 'Testing', count: 8 },
    { status: 'Completed', count: 22 },
  ];

  // NEW: Leads by Status (Horizontal Bar Chart for Pipeline feel)
  const leadStats = [
    { stage: 'New', total: 50 },
    { stage: 'Contacted', total: 35 },
    { stage: 'Qualified', total: 20 },
    { stage: 'Proposal', total: 12 },
    { stage: 'Won', total: 8 },
  ];
  return (
    <>
       <div className="dashboard-view-wrapper">
          <div className="dashboard-intro">
            <h1>General Overview</h1>
            <p>Welcome back, {user.name}. Here is what's happening today.</p>
          </div>

          <IonGrid className="ion-no-padding">
            {/* Top Row: Quick Stat Cards */}
            <IonRow>
              <IonCol size="12" sizeSm="6" sizeMd="3">
                <div className="stat-card border-blue">
                  <h3>Total Tickets</h3>
                  <p className="stat-number">80</p>
                  <span className="stat-label">Last 30 days</span>
                </div>
              </IonCol>
              <IonCol size="12" sizeSm="6" sizeMd="3">
                <div className="stat-card border-green">
                  <h3>Active Customers</h3>
                  <p className="stat-number">280</p>
                  <span className="stat-label">+12% from last month</span>
                </div>
              </IonCol>
              {/* Projects Summary Card */}
              <IonCol size="12" sizeSm="6" sizeMd="3">
                <div className="stat-card border-violet">
                  <h3>Active Projects</h3>
                  <p className="stat-number">24</p>
                  <span className="stat-label">8 Near Completion</span>
                </div>
              </IonCol>

              {/* Leads Summary Card */}
              <IonCol size="12" sizeSm="6" sizeMd="3">
                <div className="stat-card border-indigo">
                  <h3>New Leads</h3>
                  <p className="stat-number">142</p>
                  <span className="stat-label">+18% this week</span>
                </div>
              </IonCol>
            </IonRow>

            {/* Second Row: Complex Charts */}
            <IonRow className="ion-margin-top">
              {/* Ticket Status - Pie/Donut Chart */}
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

              {/* Customer Stats - Bar Chart */}
              <IonCol size="12" sizeLg="6">
                <IonCard className="chart-card">
                  <IonCardHeader>
                    <IonCardTitle>Customer Growth by Type</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <div className="h-300">
                      {isMounted && (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={customerStats}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="type" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                            <Tooltip cursor={{ fill: '#f1f5f9' }} />
                            <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>
              {/* Projects by Status */}
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
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="status" axisLine={false} tickLine={false} />
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

              {/* Leads Pipeline - Horizontal Bar Chart */}
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
        </div>
    </>
  );
};

export default DashboardPage;