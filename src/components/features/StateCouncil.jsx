import React, { useState } from 'react';
import PetitionBoard from './PetitionBoard';
import SurveyBoard from './SurveyBoard';
import { ScrollText, PieChart } from 'lucide-react';
import PropTypes from 'prop-types';

const StateCouncil = ({ defaultTab = 'petition' }) => {
    const [activeTab, setActiveTab] = useState(defaultTab);

    React.useEffect(() => {
        if (defaultTab) {
            setActiveTab(defaultTab);
        }
    }, [defaultTab]);

    return (
        <div className="space-y-6">
            {/* Inner App Tab Navigator for State Council */}
            <div className="flex bg-white rounded-2xl shadow-sm border border-gray-100 p-1 overflow-hidden" style={{ maxWidth: '400px', margin: '0 auto' }}>
                <button
                    onClick={() => setActiveTab('petition')}
                    className={`flex-1 py-3 flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all ${
                        activeTab === 'petition'
                            ? 'bg-blue-50 text-blue-600 my-0 shadow-sm'
                            : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                    }`}
                >
                    <ScrollText className="w-5 h-5" />
                    청원 게시판
                </button>
                <button
                    onClick={() => setActiveTab('survey')}
                    className={`flex-1 py-3 flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all ${
                        activeTab === 'survey'
                            ? 'bg-indigo-50 text-indigo-600 my-0 shadow-sm'
                            : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                    }`}
                >
                    <PieChart className="w-5 h-5" />
                    부서 설문조사
                </button>
            </div>

            {/* Content Rendering */}
            <div className="animate-in fade-in duration-300">
                {activeTab === 'petition' ? (
                    <PetitionBoard />
                ) : (
                    <SurveyBoard />
                )}
            </div>
        </div>
    );
};

StateCouncil.propTypes = {
    defaultTab: PropTypes.string
};

export default StateCouncil;
