import React, { useState, useEffect } from 'react';

const ResizableDivider = ({ onResize }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleMouseDown = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDragging) return;
            
            // Calculate the new width based on mouse position
            const newWidth = window.innerWidth - e.clientX;
            
            // Ensure the width is within reasonable bounds (min 300px, max 70% of window)
            const boundedWidth = Math.max(
                300, 
                Math.min(newWidth, window.innerWidth * 0.7)
            );
            
            onResize(boundedWidth);
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, onResize]);

    return (
        <div
            className={`w-2 bg-gray-300 hover:bg-blue-400 cursor-col-resize transition-colors ${
                isDragging ? 'bg-blue-500' : ''
            }`}
            onMouseDown={handleMouseDown}
            style={{ height: '100%' }}
        />
    );
};

export default ResizableDivider;
