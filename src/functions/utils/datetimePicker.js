import displayToast from "@/functions/utils/displayToast.js";

const isDateAvailable = (dateString) => {
	const date = new Date(dateString);
	const utcDay = date.getUTCDay();
	
	const disabledDays = JSON.parse(localStorage.getItem('disabledDays'))
	const disableHolidays = JSON.parse(localStorage.getItem('disableHolidays'))
	const daysOff = JSON.parse(localStorage.getItem('daysOff'))
	const holidays = JSON.parse(localStorage.getItem('holidays'))

	// daysOff are {'date': '2020-12-25', 'name': 'Christmas'}
	if (daysOff && disableHolidays) {
		const found = daysOff.find((dayOff) => {
			const dayOffDate = new Date(dayOff.date);
			if (date.toDateString() == dayOffDate.toDateString()) {
				return true;
			}
		});

		if (found) {
			return false;
		}
	}

	// Holidays are {'startDate': '2020-12-25', 'endDate': '2020-12-25', 'name': 'Christmas'}
	if (holidays && disableHolidays) {
		const found = holidays.find((holiday) => {
			const holidayStartDate = new Date(holiday.startDate);
			const holidayEndDate = new Date(holiday.endDate);
			// if date (string) is between startDate and endDate return false
			if (date > holidayStartDate && date <= holidayEndDate) {
				return true;
			}
		});

		if (found) {
			return false;
		}
	}

	if (disabledDays) {
		if (disabledDays.includes(utcDay)) {
			return false;
		}
	}

	return true;
}

function fetchDaysOffAndHolidays() {
	return new Promise((resolve, reject) => {
		try {
			// Get holidays and days off
			const DAYS_API_BASE = "https://calendrier.api.gouv.fr/jours-feries/metropole.json";
			const HOLIDAY_API_BASE = "https://data.education.gouv.fr/api/records/1.0/search/?dataset=fr-en-calendrier-scolaire&lang=fr&exclude.population=Enseignants"
	
			const currentYear = new Date().getFullYear();
			const currentMonth = new Date().getMonth();
			const academie = localStorage.getItem("acadName");
			const currentSchoolYear = currentMonth >= 8 ? currentYear + "-" + (currentYear + 1) : (currentYear - 1) + "-" + currentYear;
	
			// Fetch days off
			fetch(DAYS_API_BASE)
				.then(response => response.json())
				.then(result => {
					const daysOff = [];
	
					for (const [key, value] of Object.entries(result)) {
						const date = new Date(key);
	
						// Check if date is in current school year
						const dateYear = date.getFullYear();
						if (dateYear != currentSchoolYear.split("-")[0] && dateYear != currentSchoolYear.split("-")[1]) {
							continue;
						}
	
						const name = value;
						const dayOffObject = {
							date: date,
							name: name,
						}
						daysOff.push(dayOffObject);
					}
	
					localStorage.setItem("daysOff", JSON.stringify(daysOff));
				})
				.catch(error => console.error("[Fetch Days off]: " + error));
	
			// Fetch holidays
			const holidays = [];
			fetch(HOLIDAY_API_BASE + "&refine.location=" + academie + "&refine.annee_scolaire=" + currentSchoolYear)
				.then(response => response.json())
				.then(data => {
					data.records.forEach(record => {
						const endDate = record.fields.end_date;
						const startDate = record.fields.start_date;
						const name = record.fields.description;
						const holiday = {
							endDate: endDate,
							startDate: startDate,
							name: name,
						};
						holidays.push(holiday);
					});
			
					localStorage.setItem("holidays", JSON.stringify(holidays));
					resolve(JSON.stringify(holidays))
				})
				.catch(error => console.error("[Fetch Holidays]: " + error));
		} catch (error) {
			console.error("[datetimePicker Fetching]: " + error);
			displayToast.presentToast("Erreur lors de la récupération des jours fériés et des vacances scolaires", "danger", error)
			reject(error)
		}
	})
}

function maxCalendarDate() {
	const currentYear = new Date().getFullYear();
	const currentMonth = new Date().getMonth();
	const currentSchoolYear = currentMonth >= 8 ? currentYear + "-" + (currentYear + 1) : (currentYear - 1) + "-" + currentYear;

	const disableHolidays = JSON.parse(localStorage.getItem('disableHolidays'))
	let summerHoliday = JSON.parse(localStorage.getItem('holidays'));
	if (summerHoliday) {
		summerHoliday = summerHoliday.find(holiday => holiday.name == "Vacances d'Été");
	}
	
	if (summerHoliday && disableHolidays) {
		const maxDate = new Date(summerHoliday.startDate);
		maxDate.setDate(maxDate.getDate() + 1);
		return maxDate.toISOString().split('T')[0];
	} else {
		return currentSchoolYear.split("-")[1] + "-12-31";
	}
}

function minCalendarDate() {
	const currentYear = new Date().getFullYear();
	const currentMonth = new Date().getMonth();
	const currentSchoolYear = currentMonth >= 8 ? currentYear + "-" + (currentYear + 1) : (currentYear - 1) + "-" + currentYear;

	const disableHolidays = JSON.parse(localStorage.getItem('disableHolidays'))
	let summerHoliday = JSON.parse(localStorage.getItem('holidays'));
	if (summerHoliday) {
		summerHoliday = summerHoliday.find(holiday => holiday.name == "Vacances d'Été");
	}

	if (summerHoliday && disableHolidays) {
		const minDate = new Date(currentSchoolYear.split("-")[0] + "-" + summerHoliday.endDate.split("-")[1] + "-" + summerHoliday.endDate.split("-")[2]);
		return minDate.toISOString().split('T')[0];
	} else {
		return currentSchoolYear.split("-")[0] + "-01-01";
	}
}

export { isDateAvailable, fetchDaysOffAndHolidays, maxCalendarDate, minCalendarDate };