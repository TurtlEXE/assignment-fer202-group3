import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login/Login";
import Register from "./Login/Register";
import ForgotPassword from "./Login/ForgotPassword";
import Home from "./Customer/Home";
import CourtDetail from "./Customer/CourtDetail";
import Booking from "./Customer/Booking";
import CourtList from "./Owner/CourtList";
import Report from "./Owner/Report";
import Payment from "./Customer/Payment";
import GlobalContextProvider from "./GlobalContextProvider";
import OwnerLayout from "./Owner/OwnerLayout";
import OwnerReport from "./Owner/OwnerReport";
// import AdminLayout from "./Admin/AdminLayout";
// import AdminStats from "./Admin/AdminStats";
// import AdminComplexes from "./Admin/AdminComplexes";
// import AdminDiscount from "./Admin/AdminDiscount";
// import AdminNotify from "./Admin/AdminNotify";

const ProtectedRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem("pb_token");
    const user = JSON.parse(localStorage.getItem("pb_user") || "{}");
    if (!token) return <Navigate to="/login" replace />;
    if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
    return children;
};

function App() {
    return (
        <GlobalContextProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/" element={<ProtectedRoute allowedRoles={["customer", "admin"]}><Home /></ProtectedRoute>} />
                    <Route path="/court/:id" element={<ProtectedRoute allowedRoles={["customer", "admin"]}><CourtDetail /></ProtectedRoute>} />
                    <Route path="/booking/:id" element={<ProtectedRoute allowedRoles={["customer", "admin"]}><Booking /></ProtectedRoute>} />
                    <Route path="/dashboard" element={<ProtectedRoute allowedRoles={["owner", "admin"]}><OwnerLayout /></ProtectedRoute>}>
                        <Route index element={<Navigate to="/dashboard/courts" replace />} />
                        <Route path="courts" element={<CourtList />} />
                        <Route path="report" element={<Report />} />
                    </Route>
                    {/* <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminLayout /></ProtectedRoute>}>
                        <Route index element={<Navigate to="/admin/stats" replace />} />
                        <Route path="stats" element={<AdminStats />} />
                        <Route path="complexes" element={<AdminComplexes />} />
                        <Route path="discount" element={<AdminDiscount />} />
                        <Route path="notify" element={<AdminNotify />} />
                    </Route> */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                    <Route
                        path="/payment"
                        element={
                            <ProtectedRoute allowedRoles={["customer", "admin"]}>
                                <Payment />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/test" element={<OwnerReport />} />
                </Routes>
            </BrowserRouter>
        </GlobalContextProvider>
    );
}
export default App;
