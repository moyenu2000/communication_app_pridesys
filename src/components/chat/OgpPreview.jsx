import React from "react";

const OgpPreview = ({ data }) => {
  if (!data) return null;
  
  return (
    <div className="mt-2 mb-2 border rounded-md overflow-hidden bg-gray-50">
      <a 
        href={data.url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block hover:bg-gray-100 transition-colors"
      >
        {data.images && data.images.length > 0 && data.images[0].url && (
          <div className="w-full h-40 bg-gray-200 overflow-hidden">
            <img 
              src={data.images[0].url} 
              alt={data.title || "Link preview"} 
              className="w-full h-full object-cover"
              onError={(e) => e.target.style.display = 'none'}
            />
          </div>
        )}
        <div className="p-3">
          {data.title && (
            <h3 className="font-medium text-blue-600 truncate">{data.title}</h3>
          )}
          {data.description && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{data.description}</p>
          )}
          <p className="text-xs text-gray-500 mt-2 truncate">{data.url}</p>
        </div>
      </a>
    </div>
  );
};

export default OgpPreview;