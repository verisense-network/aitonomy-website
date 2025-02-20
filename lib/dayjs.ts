import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";

dayjs.extend(localizedFormat);
dayjs.extend(isSameOrAfter);

export default dayjs;