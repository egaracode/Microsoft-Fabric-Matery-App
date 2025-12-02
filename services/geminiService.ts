
import { GoogleGenAI, Type } from "@google/genai";
import { CourseContent, DiagnosisQuestion, UserLevel, ChatMessage, KnowledgeFile } from "../types";

const SYSTEM_INSTRUCTION = `
Actuarás como "Fabric DevOps Expert" (MentorAI), un consultor senior y mentor experto en la arquitectura de datos moderna de Microsoft Fabric, Power BI y la implementación de prácticas CI/CD (Azure DevOps, Visual Studio Code, PowerShell).
Tu rol también incluye ser el "Arquitecto de la Experiencia", definiendo la UI/UX de la aplicación final.
Tu tono es profesional, técnico, didáctico y directo al punto.
Todo el contenido generado y la interacción deben ser siempre en español.
HERRAMIENTAS DE REFERENCIA: Windows, Power BI, Microsoft Fabric, Azure DevOps, Azure, Visual Studio Code, Power Shell, Bloc de Notas y Excel.
RESTRICCIÓN DE FUENTES: No debes mostrar ni hacer referencia a URL/webs verificadas ni a la fuente de la que obtienes la información. Usa referencias simuladas.

BASE DE CONOCIMIENTO: Basa tu respuesta 100% en la documentación oficial de Microsoft (Learn, Docs) y blogs de MVPs reputados. No inventes información; usa estándares de la industria.
Si se proporcionan ARCHIVOS ADJUNTOS (PDFs), dales prioridad absoluta como fuente de verdad para el contexto específico del usuario.

FORMATO VISUAL:
1. Prioriza el uso de TABLAS MARKDOWN para comparar conceptos, listar pros/contras, o explicar arquitecturas (Ej: Pregunta Clave | Respuesta | Consideraciones).
2. Las tablas deben ser claras y concisas.
`;

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to convert KnowledgeFiles to Part objects
const getKnowledgeParts = (files: KnowledgeFile[]) => {
  return files.map(file => ({
    inlineData: {
      mimeType: file.mimeType,
      data: file.data
    }
  }));
};

export const generateDiagnosisQuestions = async (): Promise<DiagnosisQuestion[]> => {
  const model = "gemini-2.5-flash";
  const prompt = `
    Genera 3 preguntas técnicas de selección múltiple para evaluar el nivel de experiencia de un usuario en el ecosistema Microsoft Fabric, Power BI y DevOps.
    Las preguntas deben cubrir conceptos generales pero claves para clasificar en Principiante, Intermedio o Avanzado.
    Devuelve un JSON array de objetos con: id (number), question (string), options (array of strings), y correctAnswer (number, índice 0-based de la opción correcta).
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER },
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.INTEGER }
            },
            required: ["id", "question", "options", "correctAnswer"]
          },
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating diagnosis:", error);
    throw error;
  }
};

export const evaluateUserLevel = async (answers: {question: string, answer: string}[]): Promise<UserLevel> => {
  const model = "gemini-2.5-flash";
  const prompt = `
    Basado en las siguientes respuestas del usuario a preguntas técnicas, determina su nivel (Principiante, Intermedio, Avanzado).
    Respuestas: ${JSON.stringify(answers)}
    Devuelve SOLO un JSON con la propiedad "level".
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            level: { type: Type.STRING, enum: ["Principiante", "Intermedio", "Avanzado"] }
          }
        },
      },
    });

    const text = response.text;
    if (!text) return "Principiante";
    const json = JSON.parse(text);
    return json.level as UserLevel;
  } catch (error) {
    console.error("Error evaluating level:", error);
    return "Principiante";
  }
};

export const generatePillars = async (topic: string, level: UserLevel, files: KnowledgeFile[] = []): Promise<string[]> => {
  const model = "gemini-2.5-flash";
  const prompt = `
    Tema central: "${topic}".
    Nivel del usuario: "${level}".
    Genera 10 "Temas Pilar" amplios y estratégicos relacionados con el ecosistema Microsoft Fabric/Power BI/DevOps.
    Deben enfocarse en conceptos técnicos clave, componentes de la suite o etapas del ciclo de vida.
    Devuelve SOLO un JSON array de strings.
  `;

  const contents = {
    parts: [
      ...getKnowledgeParts(files),
      { text: prompt }
    ]
  };

  try {
    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating pillars:", error);
    throw error;
  }
};

export const generateVariations = async (pillar: string, level: UserLevel, files: KnowledgeFile[] = []): Promise<string[]> => {
  const model = "gemini-2.5-flash";
  const prompt = `
    Tema Pilar seleccionado: "${pillar}".
    Nivel del usuario: "${level}".
    Genera 10 "Variaciones de Lección" muy específicas y diferenciadas.
    Deben centrarse en escenarios de uso concretos, herramientas específicas y casos prácticos.
    Devuelve SOLO un JSON array de strings.
  `;

  const contents = {
    parts: [
      ...getKnowledgeParts(files),
      { text: prompt }
    ]
  };

  try {
    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating variations:", error);
    throw error;
  }
};

export const generateCourse = async (variation: string, level: UserLevel, files: KnowledgeFile[] = []): Promise<CourseContent> => {
  const model = "gemini-2.5-flash";
  
  const prompt = `
    Genera un curso técnico completo basado en la lección: "${variation}".
    Nivel del Usuario: ${level} (Ajusta el tecnicismo, profundidad y ejemplos de código acorde a este nivel).
    
    ESTRATEGIA DE CONOCIMIENTO: Utiliza únicamente el conocimiento oficial de Microsoft y mejores prácticas de la comunidad (MVPs).
    Si hay documentos adjuntos, utilízalos para enriquecer el contenido con detalles específicos.

    INSTRUCCIONES DE FORMATO OBLIGATORIAS:

    1. METADATA HEADER (Debe ir al principio exacto del markdown):
       [NIVEL ASIGNADO: ${level}]
       > **[DECLARACIÓN DE METADATOS: El contenido a continuación incluye instrucciones de implementación (UX/UI METADATA, JSON/YAML, Recursos) destinadas al desarrollador de la App, y no son contenido didáctico directo de lectura para el usuario final.]**

    2. ESTRUCTURA:
       - Divide el curso en 5 a 7 bloques temáticos (H2).
       - Usa H3 para subtemas.
       - Incluye ejemplos de código (PowerShell, JSON, YAML) en bloques de código.
       - **TABLAS**: Genera al menos 2 TABLAS MARKDOWN en el curso para comparar conceptos complejos, escenarios o configuraciones (Ej: Pregunta Clave | Respuesta | Consideraciones).

    3. ELEMENTOS VISUALES Y METADATA:
       - AL INICIO de cada bloque: [TAG DE DIAGRAMA: descripción técnica del diagrama]
       - AL FINAL de cada bloque (Barra de progreso del tema): [PROGRESO: XX] (Donde XX es 20, 40, 60, 80, 100).
       - GLOSARIO: Usa el formato [[Término|Definición corta]] para que sean clicables.
    
    4. RECURSOS SIMULADOS (Al final de cada bloque, antes del Quiz):
       - Usa el formato: [RECURSO: Documentación Oficial | Título del tema] o [RECURSO: Artículo Técnico | Título del concepto].
       - NO uses URLs.

    5. EVALUACIÓN (Al final de cada bloque, Título: "#### Evaluación del Módulo"):
       - Genera un bloque de código \`\`\`quiz con un JSON array de 5 objetos.
       - Cada objeto debe tener:
         - "question": string
         - "options": array de 5 strings (5 opciones obligatorias)
         - "correctAnswer": number (índice 0-4)
         - "explanation": string (feedback de refuerzo explicando el por qué)

    6. CIERRE DEL CURSO:
       - Sección H2: "Desafío de Aplicación Práctica" (Propuesta de proyecto real).
       - Línea final exacta: > **[BOTÓN: Volver a las 10 Variaciones de Lección anteriores]**
  `;

  // Prepare content parts
  const contentParts: any[] = [
    ...getKnowledgeParts(files),
    { text: prompt }
  ];
  
  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts: contentParts },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return {
      title: variation,
      markdown: text,
    };
  } catch (error) {
    console.error("Error generating course:", error);
    throw error;
  }
};

export const getChatResponse = async (currentMessage: string, history: ChatMessage[], files: KnowledgeFile[] = []): Promise<string> => {
  const model = "gemini-2.5-flash";
  
  // Format history for context
  const historyText = history
    .slice(-10) // Keep last 10 messages for context
    .map(msg => `${msg.role === 'user' ? 'Usuario' : 'MentorAI'}: ${msg.text}`)
    .join('\n');

  const prompt = `
    HISTORIAL DE CONVERSACIÓN PREVIA (Q&A):
    ${historyText}

    PREGUNTA ACTUAL DEL USUARIO:
    ${currentMessage}
    
    INSTRUCCIÓN:
    Responde como "MentorAI" (Fabric DevOps Expert).
    Tu respuesta debe ser técnica, precisa, didáctica y útil. 
    Basa tu respuesta 100% en la documentación oficial de Microsoft y MVPs, y en los ARCHIVOS ADJUNTOS si son relevantes.
    
    IMPORTANTE: 
    1. **FORMATO DE SALIDA:** MARKDOWN ESTÁNDAR (No devuelvas JSON, devuelve texto con formato).
    2. **USO DE TABLAS:** Si la explicación requiere comparar elementos, mostrar listas estructuradas o pasos secuenciales complejos, **UTILIZA TABLAS MARKDOWN** para facilitar la lectura y comprensión.
    3. Si la pregunta no tiene relación con Microsoft Fabric, Power BI, Azure o DevOps, indícalo amablemente.
  `;

  const contentParts: any[] = [
    ...getKnowledgeParts(files),
    { text: prompt }
  ];

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts: contentParts },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        // responseMimeType: "application/json", <--- REMOVED TO ALLOW MARKDOWN
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return text;
  } catch (error) {
    console.error("Error getting chat response:", error);
    throw error;
  }
};
