import { describe, expect, it } from "vitest";
import { buildPublicQuotationTrends, countPublicQuotationValues, summarizePublicQuotationValues } from "./quotation-statistics";
import type { PublicQuotationValue } from "./types";
const v=(priceCents:number,observedAt:string,editionId="edition-a"):PublicQuotationValue=>({editionId,priceCents,observedAt});
describe("public quotation aggregation",()=>{
 it("averages across different days and charts one point per day",()=>{
  const values=[v(45000,"2026-10-27T12:00:00Z"),v(43000,"2026-10-26T12:00:00Z"),v(47000,"2026-10-25T12:00:00Z")];
  expect(summarizePublicQuotationValues(values,"edition-a").averageCents).toBe(45000);
  expect(summarizePublicQuotationValues(values,"edition-a").observationCount).toBe(3);
  expect(buildPublicQuotationTrends(values).map(p=>[p.observedDay,p.averagePriceCents,p.observationCount])).toEqual([["2026-10-25",47000,1],["2026-10-26",43000,1],["2026-10-27",45000,1]]);
 });
 it("averages multiple quotations from the same day into one chart point",()=>{
  const values=[v(45000,"2026-10-27T10:00:00Z"),v(43000,"2026-10-27T16:00:00Z")];
  expect(buildPublicQuotationTrends(values)).toEqual([{editionId:"edition-a",observedDay:"2026-10-27",averagePriceCents:44000,observationCount:2}]);
  expect(summarizePublicQuotationValues(values,"edition-a").averageCents).toBe(44000);
 });
 it("supports a single quotation",()=>{
  const values=[v(45000,"2026-10-27T12:00:00Z")];
  expect(summarizePublicQuotationValues(values,"edition-a").averageCents).toBe(45000);
  expect(buildPublicQuotationTrends(values)).toHaveLength(1);
  expect(countPublicQuotationValues(values)).toEqual([{editionId:"edition-a",observationCount:1}]);
 });
 it("returns no indicators when there are no eligible quotations",()=>{
  expect(summarizePublicQuotationValues([],"edition-a")).toMatchObject({averageCents:null,goodPriceCents:null,greatPriceCents:null,observationCount:0});
  expect(buildPublicQuotationTrends([])).toEqual([]);
  expect(countPublicQuotationValues([])).toEqual([]);
 });
 it("excludes invalid prices and separates editions",()=>{
  const values=[v(45000,"2026-10-27T12:00:00Z","edition-a"),v(47000,"2026-10-27T12:00:00Z","edition-b"),v(0,"2026-10-27T12:00:00Z"),v(-500,"2026-10-27T12:00:00Z")];
  expect(summarizePublicQuotationValues(values,"edition-a").averageCents).toBe(45000);
  expect(summarizePublicQuotationValues(values,"edition-a").observationCount).toBe(1);
  expect(buildPublicQuotationTrends(values)).toHaveLength(2);
 });
});
