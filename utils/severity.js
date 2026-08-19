const criticalKeywords = ['trapped', 'drowning', 'unconscious', 'bleeding', 'fire', 'collapsed', 'critical'];
const highKeywords = ['injured', 'rising water', 'flooding', 'elderly', 'children', 'pregnant', 'medical'];
const mediumKeywords = ['stranded', 'stuck', 'help', 'urgent', 'need'];

const medicalKeywords = ['injured', 'bleeding', 'unconscious', 'medical', 'pregnant', 'sick', 'wound'];
const evacuationKeywords = ['evacuate', 'stranded', 'stuck', 'flooding', 'rising water', 'fire'];

const countMatches = (text, keywordList) => {
    const lowerText = text.toLowerCase();
    return keywordList.filter((word) => lowerText.includes(word)).length;
};

const calculateSeverity = ({description = '', peopleCount = 1, hasPhoto = false}) => {
    let score = 0;
    score += countMatches(description, criticalKeywords)*25;
    score += countMatches(description, highKeywords)*15;
    score += countMatches(description, mediumKeywords)*8;

    score += Math.min(Number(peopleCount)*5 , 30);

    if (hasPhoto){
        score+=10;
    }

    score = Math.min(Math.round(score), 100);

    let category = 'other';
    if (countMatches(description, medicalKeywords)>0){
        category = 'medical';
    }
    else if(countMatches(description, evacuationKeywords)>0){
        category = 'evacuation';
    }
    else if (score>0){
        category = 'rescue';
    }

    return {severityScore: score, category};
};

module.exports = calculateSeverity;