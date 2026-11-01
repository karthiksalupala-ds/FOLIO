import test from "node:test";
import assert from "node:assert/strict";
import { deleteMap, duplicateAnnots, insertAfterMap, moveMap, remapAnnots } from "./page-ops.ts";

const A = (id: string, page: number) => ({ id, page });
const pages = (xs: { id: string; page: number }[]) => xs.map((a) => `${a.id}@${a.page}`).join(",");

test("delete page drops its annotations and shifts the rest", () => {
  const out = remapAnnots([A("a", 0), A("b", 1), A("c", 2)], deleteMap(1));
  assert.equal(pages(out), "a@0,c@1");
});

test("moving a page down and up keeps annotations on their page", () => {
  const base = [A("a", 0), A("b", 1), A("c", 2), A("d", 3)];
  // move page 0 to position 2: order becomes [1,2,0,3]
  assert.equal(pages(remapAnnots(base, moveMap(0, 2))), "a@2,b@0,c@1,d@3");
  // move page 3 to position 1: order becomes [0,3,1,2]
  assert.equal(pages(remapAnnots(base, moveMap(3, 1))), "a@0,b@2,c@3,d@1");
  // moving onto itself changes nothing
  assert.equal(pages(remapAnnots(base, moveMap(2, 2))), "a@0,b@1,c@2,d@3");
});

test("moveMap is a permutation", () => {
  for (let n = 1; n <= 6; n++)
    for (let from = 0; from < n; from++)
      for (let to = 0; to < n; to++) {
        const m = moveMap(from, to);
        const seen = new Set(Array.from({ length: n }, (_, j) => m(j)));
        assert.equal(seen.size, n, `n=${n} from=${from} to=${to}`);
      }
});

test("insert after shifts later pages only", () => {
  assert.equal(pages(remapAnnots([A("a", 0), A("b", 1), A("c", 2)], insertAfterMap(0))), "a@0,b@2,c@3");
});

test("duplicate copies the page's annotations to the new page", () => {
  let n = 0;
  const out = duplicateAnnots([A("a", 0), A("b", 1), A("c", 2)], 1, () => `n${++n}`);
  assert.deepEqual(
    out.map((a) => `${a.id}@${a.page}`).sort(),
    ["a@0", "b@1", "c@3", "n1@2"],
  );
});
