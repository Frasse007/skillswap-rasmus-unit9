import { filterSkillsByCategory, calculateTotalCost, matchSkillsToUser } from '../skillswap-functions.js';

const skills = [
  { title: 'Python Tutoring', category: 'Programming', price: 20 },
  { title: 'Guitar Lessons', category: 'Music', price: 15 },
  { title: 'Resume Review', category: 'Career', price: 0 },
  { title: 'Web Development', category: 'Programming', price: 25 }
];

describe('Skills Filtering Tests', () => {
    test('should filter skills by all and return all', () => {
        const result = filterSkillsByCategory(skills, "All");
        expect(result).toBe(skills)
    });

    test('should filter skills by a specific category', () => {
        const result = filterSkillsByCategory(skills, "Programming");
        expect(result).toEqual([
            { title: 'Python Tutoring', category: 'Programming', price: 20 },
            { title: 'Web Development', category: 'Programming', price: 25 }
        ]);
    });

    test('checks for an empty array when no matches', () => {
        const result = filterSkillsByCategory(skills, 'Cooking');
        expect(result).toEqual([]);
    });
});

describe('Calculating Total Costs Tests', () => {
  test('returns the correct values for different hours and rates', () => {
    expect(calculateTotalCost(20, 2)).toBe(40);
    expect(calculateTotalCost(25, 3)).toBe(75);
  });

  test('handles free sessions (0 price) and zero hours', () => {
    expect(calculateTotalCost(0, 3)).toBe(0);
    expect(calculateTotalCost(20, 0)).toBe(0);
  });

  test('returns correct value for decimal hours', () => {
    expect(calculateTotalCost(25, 1.5)).toBe(37.5);
  });

  test('handles zero rate or negative values gracefully in calculator', () => {
    expect(calculateTotalCost(0, 5)).toBe(0);
    expect(calculateTotalCost(20, -2)).toBe(-40);
  });
});

describe('Matching Skills to User Needs', () => {
  test('matches skills by category and max price', () => {
    const userNeeds = { category: 'Programming', maxPrice: 30 };
    expect(matchSkillsToUser(userNeeds, skills)).toEqual([
      { title: 'Python Tutoring', category: 'Programming', price: 20 },
      { title: 'Web Development', category: 'Programming', price: 25 }
    ]);
  });

  test('filters by max price budget strictly', () => {
    const userNeeds = { category: 'Programming', maxPrice: 20 };
    expect(matchSkillsToUser(userNeeds, skills)).toEqual([
      { title: 'Python Tutoring', category: 'Programming', price: 20 }
    ]);
  });

  test('returns empty array for no matches', () => {
    const userNeeds = { category: 'Cooking', maxPrice: 100 };
    expect(matchSkillsToUser(userNeeds, skills)).toEqual([]);
  });

  test('includes free skills', () => {
    const userNeeds = { category: 'Career', maxPrice: 0 };
    expect(matchSkillsToUser(userNeeds, skills)).toEqual([
      { title: 'Resume Review', category: 'Career', price: 0 }
    ]);
  });

  test('matcher allows empty category filter to search by price only', () => {
    const userNeeds = { category: '', maxPrice: 20 };
    const result = matchSkillsToUser(userNeeds, skills);
    expect(result.length).toBe(3);
  });
});