module.exports.crontab = {

  /*
   * The asterisks in the key are equivalent to the
   * schedule setting in crontab, i.e.
   * minute hour day month day-of-week year
   * so in the example below it will run every minute
   */

   // * * * * * * command to execute
   // │ │ │ │ │ |
   // │ │ │ │ │ └─ Day of Week: 0-6
   // │ │ │ │ └───── Months: 0-11
   // │ │ │ └────────── Day of Month: 1-31
   // │ │ └─────────────── Hours: 0-23
   // │ └──────────────────── Minutes: 0-59
   // └───────────────────────── Seconds: 0-59

  '0 7 0 * * *': function () {
    require('../crontab/sendSummaryMailJob.js').run();
  }
};
