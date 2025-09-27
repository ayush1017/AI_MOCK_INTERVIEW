import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { FaStar, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import html2pdf from 'html2pdf.js';
const InterviewResult = ({ score = 0, feedback = [], keyStrengths = [], developmentAreas = [], recommendations = [], overallFeedback = '' }) => {
    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

     const downloadPdf=()=>{
        const pdfContent = `
        <div class="max-w-3xl mx-auto p-8 font-sans text-gray-800">
        <h1 class="text-4xl font-bold text-center mb-4">Interview Results</h1>
        <h2 class="text-2xl text-center text-blue-600 font-semibold mb-2">Overall Score: ${score}/100</h2>
        <p class="text-center text-gray-600 mb-6">${overallFeedback}</p>
    
        <h3 class="text-xl font-semibold border-b pb-1 mb-4">Detailed Feedback</h3>
        <div class="space-y-6">
          ${feedback.map((item) => `
            <div class="bg-gray-50 border border-gray-200 rounded-lg p-6 shadow-sm">
              <h4 class="text-lg font-bold mb-2">Question ${item.questionNumber}: ${item.question}</h4>
              <p class="mb-1"><span class="font-semibold">Your Response:</span> ${item.response}</p>
              <p class="mb-1"><span class="font-semibold">Technical Accuracy:</span> ${item.technicalAccuracy}</p>
              <p class="mb-1"><span class="font-semibold">Communication:</span> ${item.communication}</p>
              <p class="mb-2"><span class="font-semibold">Problem Solving:</span> ${item.problemSolving}</p>
              <p class="font-medium mb-4">Score: ${item.score}/100</p>
    
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 class="text-green-600 font-semibold mb-1">✔️ Strengths</h5>
                  <ul class="list-disc list-inside text-sm text-gray-700">
                    ${item.strengths.map(strength => `<li>${strength}</li>`).join('')}
                  </ul>
                </div>
                <div>
                  <h5 class="text-yellow-600 font-semibold mb-1">⚠️ Areas to Improve</h5>
                  <ul class="list-disc list-inside text-sm text-gray-700">
                    ${item.improvements.map(improvement => `<li>${improvement}</li>`).join('')}
                  </ul>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
    
        <div class="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 class="text-xl font-semibold text-green-700 mb-2">🌟 Key Strengths</h3>
            <ul class="list-disc list-inside text-gray-700">
              ${keyStrengths.map(strength => `<li class="mb-1">${strength}</li>`).join('')}
            </ul>
          </div>
          <div>
            <h3 class="text-xl font-semibold text-yellow-700 mb-2">📌 Areas for Development</h3>
            <ul class="list-disc list-inside text-gray-700">
              ${developmentAreas.map(area => `<li class="mb-1">${area}</li>`).join('')}
            </ul>
          </div>
        </div>
    
        <div class="mt-10">
          <h3 class="text-xl font-semibold text-blue-700 mb-2">📝 Recommendations</h3>
          <ul class="list-disc list-inside text-gray-700">
            ${recommendations.map(recommendation => `<li class="mb-1">${recommendation}</li>`).join('')}
          </ul>
        </div>
      </div>
    `;

    
    const container = document.createElement('div');
    container.innerHTML = pdfContent;
    document.body.appendChild(container); // Required for rendering in html2canvas
    
    html2pdf().from(container).set({
        margin: 1,
        filename: 'InterviewResults.pdf',
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    }).save().then(() => {
        document.body.removeChild(container); // Clean up
    });
    



     }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-lg shadow-xl p-8"
        >
            <h2 className="text-3xl font-bold text-center mb-8">Interview Results</h2>

            {/* Overall Score */}
            <div className="text-center mb-8">
                <div className={`text-6xl font-bold ${getScoreColor(score)}`}>
                    {score}/100
                </div>
                <p className="text-gray-600 mt-2">{overallFeedback}</p>
            </div>

            {/* Question-by-Question Feedback */}
            <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Detailed Feedback</h3>
                {feedback.map((item, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 mb-4">
                        <h4 className="font-semibold">Question {item.questionNumber}: {item.question}</h4>
                        <p className="text-gray-600 mt-2">Your Response: {item.response}</p>

                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white p-3 rounded shadow-sm">
                                <h5 className="font-semibold text-blue-600">Technical Accuracy</h5>
                                <p className="text-sm">{item.technicalAccuracy}</p>
                            </div>
                            <div className="bg-white p-3 rounded shadow-sm">
                                <h5 className="font-semibold text-green-600">Communication</h5>
                                <p className="text-sm">{item.communication}</p>
                            </div>
                            <div className="bg-white p-3 rounded shadow-sm">
                                <h5 className="font-semibold text-purple-600">Problem Solving</h5>
                                <p className="text-sm">{item.problemSolving}</p>
                            </div>
                        </div>

                        <div className="mt-4">
                            <div className={`text-2xl font-bold ${getScoreColor(item.score)} mb-2`}>
                                Score: {item.score}/100
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h5 className="font-semibold text-green-600 flex items-center">
                                        <FaCheckCircle className="mr-2" />
                                        Strengths
                                    </h5>
                                    <ul className="list-disc list-inside text-sm">
                                        {item.strengths.map((strength, i) => (
                                            <li key={i}>{strength}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h5 className="font-semibold text-yellow-600 flex items-center">
                                        <FaExclamationCircle className="mr-2" />
                                        Areas to Improve
                                    </h5>
                                    <ul className="list-disc list-inside text-sm">
                                        {item.improvements.map((improvement, i) => (
                                            <li key={i}>{improvement}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Summary Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                        <FaStar className="text-yellow-400 mr-2" />
                        Key Strengths
                    </h3>
                    <ul className="list-disc list-inside">
                        {keyStrengths.map((strength, index) => (
                            <li key={index} className="text-gray-700 mb-2">{strength}</li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                        <FaExclamationCircle className="text-yellow-600 mr-2" />
                        Areas for Development
                    </h3>
                    <ul className="list-disc list-inside">
                        {developmentAreas.map((area, index) => (
                            <li key={index} className="text-gray-700 mb-2">{area}</li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Recommendations */}
            <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">Recommendations</h3>
                <ul className="list-disc list-inside">
                    {recommendations.map((recommendation, index) => (
                        <li key={index} className="text-gray-700 mb-2">{recommendation}</li>
                    ))}
                </ul>
            </div>
            <button className='bg-green-500 rounded-2l px-4  hover:bg-blue-600 
               hover:text-white 
               transition ease-in-out duration-300' onClick={downloadPdf}>Download Pdf</button>
        </motion.div>
        
    );
};

InterviewResult.propTypes = {
    score: PropTypes.number,
    feedback: PropTypes.arrayOf(PropTypes.object),
    keyStrengths: PropTypes.arrayOf(PropTypes.string),
    developmentAreas: PropTypes.arrayOf(PropTypes.string),
    recommendations: PropTypes.arrayOf(PropTypes.string),
    overallFeedback: PropTypes.string,
};

export default InterviewResult;
