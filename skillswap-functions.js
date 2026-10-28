export function filterSkillsByCategory(skills, category) {
    if (category === 'All') {
        return skills;
    }
    return skills.filter(skill => skill.category === category); 
}

export function calculateTotalCost(hourlyRate, hours) {
    return hourlyRate * hours;
}

export function matchSkillsToUser(userNeeds, skills) {
    return skills.filter(skill => {
        const matchesCategory = !userNeeds.category || skill.category.trim().toLowerCase() === userNeeds.category.trim().toLowerCase();
        const matchesPrice = skill.price <= userNeeds.maxPrice;
        return matchesCategory && matchesPrice;
    });
}