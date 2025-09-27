import React from 'react';
import { motion } from 'framer-motion';
import { FaChevronRight, FaChevronLeft } from 'react-icons/fa';
import ModernTemplate from './templates/ModernTemplate';
import ClassicTemplate from './templates/ClassicTemplate';

const ResumePreview = ({ 
    formData, 
    template = 'modern', 
    isCollapsed, 
    toggleCollapse,
    previewWidth,
    className = ''
}) => {
    return (
        <motion.div 
            className={`h-full flex flex-col bg-white rounded-lg shadow-lg ${className}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ width: isCollapsed ? '40px' : previewWidth }}
            transition={{ duration: 0.3 }}
        >
            {/* Toggle button */}
            <div className="sticky top-0 z-10 bg-gray-100 p-2 flex justify-between items-center border-b border-gray-200">
                {!isCollapsed && (
                    <h3 className="text-lg font-semibold text-gray-700">Preview</h3>
                )}
                <button
                    onClick={toggleCollapse}
                    className={`p-2 rounded-full hover:bg-gray-200 transition-colors ${isCollapsed ? 'mx-auto' : ''}`}
                    aria-label={isCollapsed ? "Expand preview" : "Collapse preview"}
                >
                    {isCollapsed ? <FaChevronLeft /> : <FaChevronRight />}
                </button>
            </div>

            {/* Preview content */}
            {!isCollapsed && (
                <div className="flex-1 overflow-auto p-4 bg-gray-50">
                    <div className="transform scale-90 origin-top">
                        {template === 'modern' ? (
                            <ModernTemplate formData={formData} />
                        ) : (
                            <ClassicTemplate formData={formData} />
                        )}
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default ResumePreview;
