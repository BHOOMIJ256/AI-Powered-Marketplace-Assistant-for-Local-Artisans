// import { NextRequest, NextResponse } from "next/server";

// const STORYTELLING_API_URL = process.env.STORYTELLING_API_URL || "http://localhost:8000";

// export async function POST(request: NextRequest) {
//   try {
//     const formData = await request.formData();
    
//     // Check if AI backend is available
//     try {
//       const healthCheck = await fetch(`${STORYTELLING_API_URL}/health`, {
//         method: "GET",
//         signal: AbortSignal.timeout(2000)
//       });
      
//       if (healthCheck.ok) {
//         // Use AI backend
//         const response = await fetch(`${STORYTELLING_API_URL}/transcribe-and-respond`, {
//           method: 'POST',
//           body: formData,
//         });

//         if (response.ok) {
//           const aiData = await response.json();
          
//           // Process AI response into our format
//           const storyData = {
//             title: "AI-Generated Product Story",
//             description: aiData.ai_response || "AI-generated product description based on your input.",
//             caption: aiData.transcription ? `"${aiData.transcription}" - ${aiData.ai_response?.substring(0, 100)}...` : aiData.ai_response?.substring(0, 150) + "...",
//             hashtags: ["Handmade", "Artisan", "LocalCraft", "Sustainable", "Traditional"]
//           };
          
//           return NextResponse.json({ success: true, data: storyData });
//         }
//       }
//     } catch (error) {
//       console.log("AI backend not available, using template mode");
//     }
    
//     // Fallback to template-based generation
//     const imageFile = formData.get("image") as File;
//     const audioFile = formData.get("audio") as File;
//     const note = formData.get("note") as string;
    
//     if (!imageFile) {
//       return NextResponse.json({ success: false, error: "Image is required" }, { status: 400 });
//     }
    
//     // Generate template-based story
//     const storyData = {
//       title: "Handcrafted Product Story",
//       description: note || "This beautiful handcrafted product represents the rich tradition and skill of local artisans. Each piece is carefully crafted with attention to detail, bringing together traditional techniques with modern aesthetics. Perfect for those who appreciate authentic craftsmanship and unique designs.",
//       caption: note ? `"${note}" - A beautiful handcrafted piece that tells a story of tradition and skill. Perfect for your home or as a special gift.` : "Discover the beauty of handcrafted artistry. Each piece tells a unique story of tradition, skill, and passion.",
//       hashtags: ["Handmade", "Artisan", "LocalCraft", "Sustainable", "Traditional", "Unique"]
//     };
    
//     return NextResponse.json({ success: true, data: storyData });
    
//   } catch (error) {
//     console.error('Error generating story:', error);
//     return NextResponse.json(
//       { 
//         success: false, 
//         error: "Failed to generate story. Please try again." 
//       }, 
//       { status: 500 }
//     );
//   }
// }