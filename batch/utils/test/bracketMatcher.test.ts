// Generated by CodiumAI
import { bracketMatcher } from "../translate_utils";
describe("bracketMatcher", () => {
  // It correctly matches a left bracket to a right bracket in a simple case
  it("should correctly match a left bracket to a right bracket in a simple case", () => {
    const translated = "()";
    const expected = "()";
    expect(bracketMatcher(translated)).toBe(expected);
  });

  // It correctly matches a left bracket to a right bracket in a more complex case
  it("should correctly match a left bracket to a right bracket in a more complex case", () => {
    const translated = "[()]";
    const expected = "[()]";
    expect(bracketMatcher(translated)).toBe(expected);
  });

  // It correctly matches a left bracket to a right bracket when there are multiple brackets of the same type
  it("should correctly match a left bracket to a right bracket when there are multiple brackets of the same type", () => {
    const translated = "[[[]]]";
    const expected = "[[[]]]";
    expect(bracketMatcher(translated)).toBe(expected);
  });

  // It returns an empty string when the input contains only a right bracket
  it("should return an empty string when the input contains only a right bracket", () => {
    const translated = ")";
    const expected = "()";
    expect(bracketMatcher(translated)).toBe(expected);
  });

  // It returns an empty string when the input contains only a left bracket
  it("should return an empty string when the input contains only a left bracket", () => {
    const translated = "(";
    const expected = "(";
    expect(bracketMatcher(translated)).toBe(expected);
  });

  // It returns an empty string when the input contains only a left bracket followed by a non-bracket character
  it("should return an empty string when the input contains only a left bracket followed by a non-bracket character", () => {
    const translated = "(A";
    const expected = "(A";
    expect(bracketMatcher(translated)).toBe(expected);
  });
  // input = 'abece]dfsdf[asddf]' output = 'abece]dfsdf[asddf]'
  it("should correctly match a left bracket to a right bracket in a complex case", () => {
    const translated = "abece]dfsdf[asddf]";
    const expected = "[abece]dfsdf[asddf]";
    expect(bracketMatcher(translated)).toBe(expected);
  });

  // input = 'asfas】dfasd[fasdfasdf]', output = '【asfas】dfasd[fasdfasdf]'
  it("should correctly match a left bracket to a right bracket in a complex case", () => {
    const translated = "asfas】dfasd[fasdfasdf]";
    const expected = "【asfas】dfasd[fasdfasdf]";
    expect(bracketMatcher(translated)).toBe(expected);
  });
});
