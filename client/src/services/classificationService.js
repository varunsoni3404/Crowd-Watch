const CATEGORY_MAPPING = {
  "pothole on road": "Potholes",
  "drainage issue": "Drainage",
  "garbage problem": "Sanitation",
  "streetlight not working": "Streetlights",
};

// Legacy function for backward compatibility
export const classifyImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch('http://127.0.0.1:8080/classify', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Classification failed: ${response.statusText}`);
  }

  const result = await response.json();
  const detectedCategory = result.category;
  
  return CATEGORY_MAPPING[detectedCategory.toLowerCase()] || 'Other';
};

// New function to analyze issue and get complete response
export const analyzeIssue = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch('http://127.0.0.1:8080/report-issue', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Issue analysis failed: ${response.statusText}`);
  }

  const result = await response.json();
  
  // Map the category to match your form categories
  const mappedCategory = CATEGORY_MAPPING[result.category?.toLowerCase()] || result.category || 'Other';
  
  return {
    category: mappedCategory,
    title: result.title || '',
    description: result.description || ''
  };
};