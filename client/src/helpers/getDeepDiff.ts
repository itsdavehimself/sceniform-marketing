import _ from "lodash";

function getDeepDiff(obj1: any, obj2: any) {
  const diffs: any[] = [];
  const allKeys = _.union(_.keys(obj1), _.keys(obj2));

  function check(key: string, val1: any, val2: any, parentKey = "") {
    const fullKey = parentKey ? `${parentKey}.${key}` : key;
    if (_.isEqual(val1, val2)) return;
    if (_.isObject(val1) && _.isObject(val2) && !_.isArray(val1)) {
      const keys = _.union(_.keys(val1), _.keys(val2));
      keys.forEach((k) => check(k, val1[k], val2[k], fullKey));
    } else {
      diffs.push({
        field: fullKey,
        oldValue: val1,
        newValue: val2,
      });
    }
  }

  allKeys.forEach((k) => check(k, obj1[k], obj2[k]));
  return diffs;
}

export { getDeepDiff };
