import React from "react";

export const Skeleton = ({ className = "", style = {} }) => {
  return (
    <div 
      className={`skeleton ${className}`} 
      style={style}
      aria-hidden="true"
    />
  );
};

export const SkeletonText = ({ lines = 1, className = "" }) => {
  return (
    <>
      {[...Array(lines)].map((_, i) => (
        <Skeleton 
          key={i} 
          className={`skeleton-text ${className}`} 
          style={{ width: i === lines - 1 && lines > 1 ? "60%" : "100%" }} 
        />
      ))}
    </>
  );
};

export const SkeletonCircle = ({ size = "50px", className = "" }) => {
  return (
    <Skeleton 
      className={`skeleton-circle ${className}`} 
      style={{ width: size, height: size }} 
    />
  );
};

export const SkeletonTitle = ({ className = "" }) => {
  return <Skeleton className={`skeleton-title ${className}`} />;
};

export const SkeletonCard = ({ className = "" }) => {
  return <Skeleton className={`skeleton-card ${className}`} />;
};

export const SkeletonButton = ({ className = "" }) => {
  return <Skeleton className={`skeleton-btn ${className}`} />;
};

export const SkeletonPill = ({ className = "" }) => {
  return <Skeleton className={`skeleton-pill ${className}`} />;
};
