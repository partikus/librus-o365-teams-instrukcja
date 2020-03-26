const fs = require('fs');
const parse = require('csv-parse/lib/sync');

const domain = process.argv[2];
const importDir = process.argv[3];

if (!domain) throw new Error('Missing domain argument e.g. yarn generate myschool.com');
if (!importDir) throw new Error('Missing sds import directory argument e.g. yarn generate myschool.com /Users/school/Downloads/sds-export');


const students = parse(
	fs.readFileSync(`${importDir}/student.csv`),
	{
	skip_empty_lines: true,
});
const teachers = parse(
	fs.readFileSync(`${importDir}/teacher.csv`),
	{
	skip_empty_lines: true,
});
const templateStudent = fs.readFileSync(`${__dirname}/template_student.html`);
const templateTeacher = fs.readFileSync(`${__dirname}/template_teacher.html`);
const templateIndex = fs.readFileSync(`${__dirname}/template_index.html`);

// removing headers
students.shift();
teachers.shift();

const studentsMessages = [];
const teachersMessages = [];
// SIS ID,School SIS ID,Username,First Name,Last Name,Password
for (const [sisID, schoolID, username, firstName, lastName, pass] of students) {
	studentsMessages.push(
		`${templateStudent}`
			.replace('{{ user }}', `${firstName} ${lastName} (${username})`)
			.replace('{{ email }}', `${username}@${domain}`)
			.replace('{{ pass }}', pass)
	);
}
// SIS ID,School SIS ID,Username,First Name,Last Name,Password
for (const [sisID, schoolID, username, firstName, lastName, pass] of teachers) {
	teachersMessages.push(
		`${templateTeacher}`
			.replace('{{ user }}', `${firstName} ${lastName} (${username})`)
			.replace('{{ email }}', `${username}@${domain}`)
			.replace('{{ pass }}', pass)
	);
}


fs.writeFileSync(
	`${importDir}/students.html`,
	`${templateIndex}`.replace('{{ body }}', studentsMessages.join('<div style="page-break-before: always;"/>'))
);

fs.writeFileSync(
	`${importDir}/teachers.html`,
	`${templateIndex}`.replace('{{ body }}', teachersMessages.join('<div style="page-break-before: always;"/>'))
);
