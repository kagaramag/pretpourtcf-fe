import moment from "moment";

export const date = (
  date: string | Date,
  ago: boolean = true,
  format: string = "MM/DD/YYYY"
) => {
  if (ago) {
    return moment(date).fromNow();
  }

  return moment(date).format(format);
};