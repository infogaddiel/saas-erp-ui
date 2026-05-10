import React, { useState } from 'react';
import {
    IonGrid, IonRow, IonCol, IonCard, IonCardHeader,
    IonCardTitle, IonCardContent, IonSelect, IonSelectOption, IonItem, IonLabel, IonButtons
} from '@ionic/react';
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const FinanceDashboard: React.FC = () => {
    const [year, setYear] = useState('2026');

    // Updated Data: Only Invoice has a Tax breakdown
    const financeData = [
        { month: 'Jan', invPrice: 4000, invTax: 720, cnAmount: 590, dnAmount: 236 },
        { month: 'Feb', invPrice: 3000, invTax: 540, cnAmount: 236, dnAmount: 944 },
        { month: 'Mar', invPrice: 5000, invTax: 900, cnAmount: 354, dnAmount: 472 },
        { month: 'Apr', invPrice: 4500, invTax: 810, cnAmount: 118, dnAmount: 177 },
    ];
    // Data derived from your PO Table
    const poStatusData = [
        { name: 'Approved', value: 1, color: '#10b981' },
        { name: 'Pending', value: 1, color: '#f59e0b' },
        { name: 'Draft', value: 0, color: '#64748b' },
        { name: 'Rejected', value: 0, color: '#ef4444' },
    ];

    const poVendorData = [
        { vendor: 'Rajesh Malhotra', amount: 5566660 },
        { vendor: 'Test Vendor', amount: 4500 },
        // As you add more POs, this list will populate your top 5 vendors
    ];


    return (
        <div className="finance-view-wrapper">
            <div className="dashboard-intro">
                <h1>Finance Overview</h1>
            </div>
            <IonGrid className="ion-no-padding">
                {/* Local Filter for Finance */}
                <IonRow className="ion-justify-content-start">
                    <IonCol size="12" sizeMd="4">
                        <IonItem lines="none" className="filter-item ion-margin-bottom">
                            <IonLabel>Fiscal Year</IonLabel>
                            <IonSelect value={year} interface="popover" onIonChange={e => setYear(e.detail.value)}>
                                <IonSelectOption value="2025">2025</IonSelectOption>
                                <IonSelectOption value="2026">2026</IonSelectOption>
                            </IonSelect>
                        </IonItem>
                    </IonCol>
                </IonRow>

                <IonRow>
                    <IonCol size="12">
                        <IonCard className="chart-card">
                            <IonCardHeader>
                                <IonCardTitle>Revenue vs. Adjustments</IonCardTitle>
                            </IonCardHeader>
                            <IonCardContent>
                                <div className="h-400">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={financeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} tickFormatter={(value) => `₹${value}`} />
                                            <Tooltip
                                                cursor={{ fill: '#f8fafc' }}
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            />
                                            <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '20px' }} />

                                            {/* Invoice: Stays Stacked (Price + Tax) */}
                                            <Bar dataKey="invPrice" name="Invoice (Net)" stackId="inv" fill="#3b82f6" barSize={35} />
                                            <Bar dataKey="invTax" name="GST (Invoice)" stackId="inv" fill="#93c5fd" />

                                            {/* Credit Note: Single Bar (No Tax) */}
                                            <Bar dataKey="cnAmount" name="Credit Note" fill="#ef4444" barSize={35} />

                                            {/* Debit Note: Single Bar (No Tax) */}
                                            <Bar dataKey="dnAmount" name="Debit Note" fill="#10b981" barSize={35} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </IonCardContent>
                        </IonCard>
                    </IonCol>
                </IonRow>
                <IonRow className="ion-margin-top">

                    {/* PO Status Donut Chart */}
                    <IonCol size="12" sizeLg="5">
                        <IonCard className="chart-card">
                            <IonCardHeader>
                                <IonCardTitle>PO Approval Pipeline</IonCardTitle>
                            </IonCardHeader>
                            <IonCardContent>
                                <div className="h-300">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={poStatusData}
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {poStatusData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                                            />
                                            <Legend verticalAlign="bottom" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </IonCardContent>
                        </IonCard>
                    </IonCol>

                    {/* PO by Vendor Horizontal Bar Chart */}
                    <IonCol size="12" sizeLg="7">
                        <IonCard className="chart-card">
                            <IonCardHeader>
                                <IonCardTitle>Purchase Commitment by Vendor</IonCardTitle>
                            </IonCardHeader>
                            <IonCardContent>
                                <div className="h-300">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={poVendorData} layout="vertical" margin={{ left: 40, right: 40 }}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                            <XAxis type="number" hide />
                                            <YAxis
                                                dataKey="vendor"
                                                type="category"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }}
                                                width={100}
                                            />
                                            <Tooltip
                                                formatter={(value: any) => `₹${Number(value).toLocaleString()}`}
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            />
                                            <Bar dataKey="amount" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={25} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </IonCardContent>
                        </IonCard>
                    </IonCol>

                </IonRow>
            </IonGrid>
        </div>
    );
};

export default FinanceDashboard;