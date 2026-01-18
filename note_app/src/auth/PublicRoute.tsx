import { Navigate } from "react-router-dom";
import { ReactNode } from "react";

import React from 'react'

function PublicRoute({children}: {children: ReactNode}) {
    const token = localStorage.getItem("token");

    if(token){
        return <Navigate to="/dashboard" replace />;
    }
  return children;
}

export default PublicRoute