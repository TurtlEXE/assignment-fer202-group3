import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login/Login";
import Register from "./Login/Register";
import Home from "./Customer/Home";
import CourtDetail from "./Customer/CourtDetail";
import Booking from "./Customer/Booking";
import CourtList from "./Owner/CourtList";
import Payment from "./Customer/Payment";
import GlobalContextProvider from "./GlobalContextProvider";
import OwnerLayout from "./Owner/OwnerLayout";
import OwnerReport from "./Owner/OwnerReport";
import ComplexRegistration from "./Owner/ComplexRegistration";
import AdminReport from "./Admin/AdminReport";
import AdminRegistration from "./Admin/AdminRegistration";
import AdminLayout from "./Admin/AdminLayout";

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
                    <Route path="/login" index element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/" element={<ProtectedRoute allowedRoles={["customer", "admin"]}><Home /></ProtectedRoute>} />
                    <Route path="/court/:id" element={<ProtectedRoute allowedRoles={["customer", "admin"]}><CourtDetail /></ProtectedRoute>} />
                    <Route path="/booking/:id" element={<ProtectedRoute allowedRoles={["customer", "admin"]}><Booking /></ProtectedRoute>} />
                    <Route path="/dashboard" element={<ProtectedRoute allowedRoles={["owner", "admin"]}><OwnerLayout /></ProtectedRoute>}>
                        <Route index element={<Navigate to="/dashboard/courts" replace />} />
                        <Route path="courts" element={<CourtList />} />
                        <Route path="report" element={<OwnerReport />} />
                        <Route path="complexregister" element={<ComplexRegistration/>}/>
                    </Route>
                     <Route path="/admindashboard" element={<ProtectedRoute allowedRoles={[ "admin"]}><AdminLayout/></ProtectedRoute>}>
                        <Route index element={<Navigate to="/admindashboard/adminreport" replace />} />
                        <Route path="adminreport" element={<AdminReport />} />
                        <Route path="adminregistration" element={<AdminRegistration/>}/>
                    </Route>
                    <Route path="*" element={<Navigate to="/" replace />} />
                    <Route
                        path="/payment"
                        element={
                            <ProtectedRoute allowedRoles={["customer", "admin"]}>
                                <Payment />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/test" element={<OwnerReport/>}/>
                </Routes>
            </BrowserRouter>
        </GlobalContextProvider>
    );
}
export default App;