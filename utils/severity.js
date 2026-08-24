const calculateSeverity = ({ description = "", peopleCount = 1, hasPhoto = false }) => {
    const text = description.toLowerCase();
    let category = "other";

    const medicalKeywords = [
        "injured",
        "injury",
        "bleeding",
        "unconscious",
        "hospital",
        "medical",
        "fracture",
        "pain",
        "heart",
        "breathing",
        "critical"
    ];

    const rescueKeywords = [
        "trapped",
        "stuck",
        "rescue",
        "collapsed",
        "under debris",
        "cannot escape",
        "unable to escape",
        "stranded"
    ];

    const evacuationKeywords = [
        "evacuate",
        "evacuation",
        "flood",
        "water rising",
        "fire",
        "landslide",
        "earthquake",
        "danger zone",
        "building collapse"
    ];

    if (medicalKeywords.some(keyword => text.includes(keyword))) {
        category = "medical";
    }

    else if (rescueKeywords.some(keyword => text.includes(keyword))) {
        category = "rescue";
    }

    else if (evacuationKeywords.some(keyword => text.includes(keyword))) {
        category = "evacuation";
    }

    return {
        category
    };
};

module.exports = calculateSeverity;