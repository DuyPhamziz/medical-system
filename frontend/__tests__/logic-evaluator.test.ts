import { evaluateCondition, evaluateFormula } from "../lib/logic-evaluator";

describe("Logic Evaluator", () => {
  describe("evaluateCondition", () => {
    const answers = {
      age: 25,
      gender: "male",
      symptoms: ["fever", "cough"],
      nested: { value: 10 }
    };

    test("should evaluate simple equality", () => {
      expect(evaluateCondition("{{age}} === 25", answers)).toBe(true);
      expect(evaluateCondition("{{gender}} === 'male'", answers)).toBe(true);
      expect(evaluateCondition("{{gender}} === 'female'", answers)).toBe(false);
    });

    test("should evaluate numeric comparisons", () => {
      expect(evaluateCondition("{{age}} > 18", answers)).toBe(true);
      expect(evaluateCondition("{{age}} < 10", answers)).toBe(false);
    });

    test("should handle includes() for arrays", () => {
      expect(evaluateCondition("{{symptoms}}.includes('fever')", answers)).toBe(true);
      expect(evaluateCondition("{{symptoms}}.includes('headache')", answers)).toBe(false);
    });

    test("should handle complex logical operators", () => {
      expect(evaluateCondition("{{age}} > 18 && {{gender}} === 'male'", answers)).toBe(true);
      expect(evaluateCondition("{{age}} < 18 || {{symptoms}}.includes('fever')", answers)).toBe(true);
    });
  });

  describe("evaluateFormula", () => {
    const answers = {
      weight: 70,
      height: 1.75,
      a: 10,
      b: 20
    };

    test("should calculate simple math", () => {
      expect(evaluateFormula("{{a}} + {{b}}", answers)).toBe(30);
      expect(evaluateFormula("{{b}} - {{a}}", answers)).toBe(10);
      expect(evaluateFormula("{{a}} * 2", answers)).toBe(20);
    });

    test("should calculate BMI correctly", () => {
      // BMI = weight / (height * height)
      const bmi = 70 / (1.75 * 1.75);
      expect(evaluateFormula("{{weight}} / ({{height}} * {{height}})", answers)).toBeCloseTo(bmi);
    });

    test("should return 0 for invalid formulas", () => {
      expect(evaluateFormula("invalid + formula", answers)).toBe(0);
    });
  });
});
