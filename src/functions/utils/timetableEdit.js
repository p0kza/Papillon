function setSameTimeCourses(timetable) {
	for(let i = 0; i < timetable.length; i++) {
		const lesson = timetable[i];
		const lessonStart = new Date(lesson.time.start);
		const lessonEnd = new Date(lesson.time.end);

		for(let j = 0; j < timetable.length; j++) {
			const lesson2 = timetable[j];
			const lesson2Start = new Date(lesson2.time.start);
			const lesson2End = new Date(lesson2.time.end);

			if (lessonStart <= lesson2Start && lessonEnd >= lesson2End && lesson.course.num != lesson2.course.num) {
				if (lesson.course.num > lesson2.course.num) {
					timetable[j].course.sameTime = true;
				}
				else {
					timetable[i].course.sameTime = true;
				}
			}
		}
	}

	return timetable;
}

function setActualCourse(timetable) {
	const now = new Date();

	for(let i = 0; i < timetable.length; i++) {
		const lesson = timetable[i];
		const lessonStart = new Date(lesson.time.start);
		const lessonEnd = new Date(lesson.time.end);

		if (lessonStart <= now && lessonEnd >= now && lesson.course.sameTime == false) {
			timetable[i].course.actual = true;
		} else {
			timetable[i].course.actual = false;
		}
	}

	return timetable;
}

function setCoursesGap(timetable) {
	for(let i = 0; i < timetable.length; i++) {
		const lesson = timetable[i];
		const lessonStart = new Date(lesson.time.start);

		if (i > 0) {
			const previousLesson = timetable[i - 1];
			const previousLessonEnd = new Date(previousLesson.time.end);

			if (lessonStart - previousLessonEnd >= 1000 * 60 * 15) {
				timetable[i].course.distance = true;
			}
		}
	}

	return timetable;
}

function setCoursesLength(timetable) {
	for(let i = 0; i < timetable.length; i++) {
		const lesson = timetable[i];
		const lessonStart = new Date(lesson.time.start);
		const lessonEnd = new Date(lesson.time.end);

		let length = lessonEnd - lessonStart;
		length = length / 1000 / 60 / 60;

		timetable[i].course.lengthCours = length;
	}

	return timetable;
}

function editTimetable(timetable) {
	timetable = setSameTimeCourses(timetable);
	timetable = setCoursesLength(timetable);
	timetable = setCoursesGap(timetable);
	timetable = setActualCourse(timetable);

	return timetable;
}

export default editTimetable;