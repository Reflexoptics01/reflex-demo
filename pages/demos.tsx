import React from 'react';

const DemosPage = () => {
    return (
        <div className="w-full h-screen overflow-x-hidden">
            <iframe 
                src="https://reflex-html.netlify.app/"
                className="w-full h-full border-0"
                title="Reflex HTML"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            />
        </div>
    );
};

export default DemosPage;   