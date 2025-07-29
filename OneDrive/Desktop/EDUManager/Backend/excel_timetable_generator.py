"""
🎯 Automated Timetable Generation System
📚 Developed for College/University Course Scheduling
🔧 Author: AI Assistant
📅 Features: Conflict-free scheduling, Excel input/output, Multiple formats

Requirements:
- pandas
- numpy
- openpyxl (for Excel support)
"""

import pandas as pd
import numpy as np
import random
from collections import defaultdict
import warnings
import os
import sys
warnings.filterwarnings('ignore')

class AutomatedTimetableGenerator:
    """
    🎯 Main class for automated timetable generation
    """

    def __init__(self, excel_file_path):
        """
        Initialize the timetable generator

        Args:
            excel_file_path (str): Path to Excel file containing course data
        """
        self.excel_file_path = excel_file_path
        self.courses_data = None
        self.faculty_data = None

        # Time configuration
        self.days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        self.periods = ['9:00-10:00', '10:00-11:00', '11:15-12:15', '12:15-13:15', '14:15-15:15', '15:15-16:15']
        self.time_slots = []

        # Timetable storage
        self.faculty_timetable = defaultdict(lambda: defaultdict(list))
        self.class_timetable = defaultdict(lambda: defaultdict(list))

        # Initialize system
        self.load_data()
        self.process_data()

    def load_data(self):
        """📁 Load data from Excel file"""
        try:
            self.courses_data = pd.read_excel(self.excel_file_path, sheet_name=0)
            print(f" Data loaded successfully! Courses: {len(self.courses_data)}")
        except Exception as e:
            print(f" Error loading data: {e}")
            raise

    def parse_ltp(self, ltp_string):
        """
        📝 Parse L/T/P format (Lecture/Tutorial/Practical)

        Args:
            ltp_string (str): Format like "3/0/2"

        Returns:
            dict: {"L": 3, "T": 0, "P": 2}
        """
        if pd.isna(ltp_string) or not isinstance(ltp_string, str):
            return {"L": 0, "T": 0, "P": 0}

        try:
            parts = ltp_string.split('/')
            return {
                "L": int(parts[0]) if len(parts) > 0 else 0,
                "T": int(parts[1]) if len(parts) > 1 else 0,
                "P": int(parts[2]) if len(parts) > 2 else 0
            }
        except:
            return {"L": 0, "T": 0, "P": 0}

    def process_data(self):
        """🔄 Process and clean the raw data"""
        # Clean data
        self.courses_data = self.courses_data.dropna(subset=['Branch', 'Course Code'])

        # Parse L/T/P for each course
        self.courses_data['LTP_parsed'] = self.courses_data['L/T/P'].apply(self.parse_ltp)
        self.courses_data['Lectures'] = self.courses_data['LTP_parsed'].apply(lambda x: x['L'])
        self.courses_data['Tutorials'] = self.courses_data['LTP_parsed'].apply(lambda x: x['T'])
        self.courses_data['Practicals'] = self.courses_data['LTP_parsed'].apply(lambda x: x['P'])
        self.courses_data['Total_Sessions'] = (self.courses_data['Lectures'] + 
                                             self.courses_data['Tutorials'] + 
                                             self.courses_data['Practicals'])

        print(" Data processed successfully!")

    def generate_time_slots(self):
        """📅 Generate all available time slots"""
        self.time_slots = [(day, period) for day in self.days for period in self.periods]
        return self.time_slots

    def check_faculty_conflict(self, faculty_name, day, period):
        """⚡ Check if faculty has scheduling conflict"""
        if not faculty_name or faculty_name == "N.R." or pd.isna(faculty_name):
            return False

        current_assignments = self.faculty_timetable[faculty_name][day]
        return any(slot['period'] == period for slot in current_assignments)

    def check_class_conflict(self, branch, semester, day, period):
        """⚡ Check if class has scheduling conflict"""
        class_key = f"{branch}_{semester}"
        current_assignments = self.class_timetable[class_key][day]
        return any(slot['period'] == period for slot in current_assignments)

    def assign_session(self, course_row, session_type, day, period):
        """
        📋 Assign a session to timetable if no conflicts

        Returns:
            bool: True if successfully assigned, False otherwise
        """
        branch = course_row['Branch']
        semester = course_row['Semester']
        course_name = course_row['Course Name']
        course_code = course_row['Course Code']
        main_faculty = course_row['Main Faculty']
        co_faculty = course_row.get('Co-Faculty', None)

        # Check conflicts
        if self.check_faculty_conflict(main_faculty, day, period):
            return False

        if co_faculty and co_faculty != "N.R." and not pd.isna(co_faculty):
            if self.check_faculty_conflict(co_faculty, day, period):
                return False

        if self.check_class_conflict(branch, semester, day, period):
            return False

        # Create session object
        session = {
            'period': period,
            'course_code': course_code,
            'course_name': course_name,
            'session_type': session_type,
            'branch': branch,
            'semester': semester,
            'main_faculty': main_faculty,
            'co_faculty': co_faculty if co_faculty and co_faculty != "N.R." else None
        }

        # Assign to faculty timetables
        if main_faculty and main_faculty != "N.R.":
            self.faculty_timetable[main_faculty][day].append(session.copy())

        if session['co_faculty']:
            self.faculty_timetable[session['co_faculty']][day].append(session.copy())

        # Assign to class timetable
        class_key = f"{branch}_{semester}"
        self.class_timetable[class_key][day].append(session)

        return True

    def distribute_sessions(self, course_row):
        """
        📊 Distribute all sessions of a course across the week

        Returns:
            tuple: (scheduled_sessions, total_required_sessions)
        """
        lectures = course_row['Lectures']
        tutorials = course_row['Tutorials']
        practicals = course_row['Practicals']

        # Create session list
        sessions_to_schedule = (['Lecture'] * lectures + 
                              ['Tutorial'] * tutorials + 
                              ['Practical'] * practicals)

        scheduled_sessions = 0
        available_slots = self.time_slots.copy()
        random.shuffle(available_slots)  # Randomize for better distribution

        for session_type in sessions_to_schedule:
            for day, period in available_slots:
                if self.assign_session(course_row, session_type, day, period):
                    scheduled_sessions += 1
                    break

        return scheduled_sessions, len(sessions_to_schedule)

    def generate_timetable(self):
        """
        🚀 Main method to generate complete timetable

        Returns:
            dict: Generation statistics
        """
        print(" Starting automated timetable generation...")

        self.generate_time_slots()

        total_courses = len(self.courses_data)
        successfully_scheduled = 0
        total_sessions_scheduled = 0
        total_sessions_required = 0

        # Process each course
        for idx, course_row in self.courses_data.iterrows():
            if pd.isna(course_row['Branch']) or pd.isna(course_row['Course Code']):
                continue

            scheduled, required = self.distribute_sessions(course_row)
            total_sessions_scheduled += scheduled
            total_sessions_required += required

            if scheduled == required:
                successfully_scheduled += 1

        # Generate statistics
        stats = {
            'total_courses': total_courses,
            'successfully_scheduled': successfully_scheduled,
            'success_rate': (successfully_scheduled/total_courses)*100 if total_courses > 0 else 0,
            'sessions_scheduled': total_sessions_scheduled,
            'sessions_required': total_sessions_required,
            'session_success_rate': (total_sessions_scheduled/total_sessions_required)*100 if total_sessions_required > 0 else 0
        }

        print(f" Generation Complete!")
        print(f"    Courses Scheduled: {successfully_scheduled}/{total_courses} ({stats['success_rate']:.1f}%)")
        print(f"    Sessions Scheduled: {total_sessions_scheduled}/{total_sessions_required} ({stats['session_success_rate']:.1f}%)")

        return stats

    def export_faculty_timetable(self, filename="faculty_timetable.csv", format="csv"):
        """📤 Export faculty timetable"""
        faculty_rows = []

        for faculty_name, schedule in self.faculty_timetable.items():
            for day in self.days:
                for session in schedule.get(day, []):
                    faculty_rows.append({
                        'Faculty': faculty_name,
                        'Day': day,
                        'Period': session['period'],
                        'Course Code': session['course_code'],
                        'Course Name': session['course_name'],
                        'Session Type': session['session_type'],
                        'Branch': session['branch'],
                        'Semester': session['semester'],
                        'Co-Faculty': session.get('co_faculty', '')
                    })

        df = pd.DataFrame(faculty_rows)

        if format.lower() == "excel":
            df.to_excel(filename.replace('.csv', '.xlsx'), index=False)
        else:
            df.to_csv(filename, index=False)

        print(f" Faculty timetable exported to {filename}")
        return df

    def export_class_timetable(self, filename="class_timetable.csv", format="csv"):
        """📤 Export class timetable"""
        class_rows = []

        for class_key, schedule in self.class_timetable.items():
            branch, semester = class_key.split('_', 1)
            for day in self.days:
                for session in schedule.get(day, []):
                    class_rows.append({
                        'Branch': branch,
                        'Semester': semester,
                        'Day': day,
                        'Period': session['period'],
                        'Course Code': session['course_code'],
                        'Course Name': session['course_name'],
                        'Session Type': session['session_type'],
                        'Main Faculty': session['main_faculty'],
                        'Co-Faculty': session.get('co_faculty', '')
                    })

        df = pd.DataFrame(class_rows)

        if format.lower() == "excel":
            df.to_excel(filename.replace('.csv', '.xlsx'), index=False)
        else:
            df.to_csv(filename, index=False)

        print(f" Class timetable exported to {filename}")
        return df

    def export_department_summary(self, filename="department_summary.csv"):
        """📊 Export department-wise summary"""
        summary_data = []

        for class_key, schedule in self.class_timetable.items():
            branch, semester = class_key.split('_', 1)
            total_sessions = sum(len(sessions) for sessions in schedule.values())

            # Count session types
            lecture_count = 0
            practical_count = 0
            tutorial_count = 0

            for day_sessions in schedule.values():
                for session in day_sessions:
                    if session['session_type'] == 'Lecture':
                        lecture_count += 1
                    elif session['session_type'] == 'Practical':
                        practical_count += 1
                    elif session['session_type'] == 'Tutorial':
                        tutorial_count += 1

            summary_data.append({
                'Branch': branch,
                'Semester': semester,
                'Total Sessions': total_sessions,
                'Lectures': lecture_count,
                'Practicals': practical_count,
                'Tutorials': tutorial_count
            })

        df = pd.DataFrame(summary_data)
        df.to_csv(filename, index=False)
        print(f" Department summary exported to {filename}")
        return df

    def get_analytics(self):
        """📈 Get comprehensive analytics"""
        analytics = {}

        # Faculty workload
        faculty_workload = {}
        for faculty_name, schedule in self.faculty_timetable.items():
            total_sessions = sum(len(sessions) for sessions in schedule.values())
            faculty_workload[faculty_name] = total_sessions

        analytics['faculty_workload'] = dict(sorted(faculty_workload.items(), 
                                                  key=lambda x: x[1], reverse=True))

        # Branch distribution
        branch_sessions = {}
        for class_key, schedule in self.class_timetable.items():
            branch = class_key.split('_')[0]
            total_sessions = sum(len(sessions) for sessions in schedule.values())
            branch_sessions[branch] = branch_sessions.get(branch, 0) + total_sessions

        analytics['branch_distribution'] = dict(sorted(branch_sessions.items(), 
                                                     key=lambda x: x[1], reverse=True))

        # Daily distribution
        daily_distribution = {day: 0 for day in self.days}
        for schedule in self.class_timetable.values():
            for day in self.days:
                daily_distribution[day] += len(schedule.get(day, []))

        analytics['daily_distribution'] = daily_distribution

        return analytics

    def get_stats(self):
        """📊 Get simplified stats for API response"""
        stats = self.generate_timetable()
        
        # Export files to generated_timetables directory
        output_dir = os.path.join(os.path.dirname(__file__), "generated_timetables")
        os.makedirs(output_dir, exist_ok=True)
        
        self.export_faculty_timetable(os.path.join(output_dir, "faculty_timetable.csv"))
        self.export_class_timetable(os.path.join(output_dir, "class_timetable.csv"))
        self.export_department_summary(os.path.join(output_dir, "department_summary.csv"))
        
        analytics = self.get_analytics()
        
        return {
            'courses': stats['total_courses'],
            'sessions_required': stats['sessions_required'],
            'sessions_scheduled': stats['sessions_scheduled'],
            'success_rate': round(stats['success_rate'], 2),
            'faculty_summary': analytics['faculty_workload'],
            'branch_summary': analytics['branch_distribution'],
            'conflicts': stats['sessions_required'] - stats['sessions_scheduled']
        }


def generate_from_excel(filepath: str) -> dict:
    """
    Reads Excel file, generates timetables, and returns stats.
    """
    try:
        gen = AutomatedTimetableGenerator(filepath)
        stats = gen.get_stats()
        print(f"Returned stats: {stats}")
        return stats
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        raise


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        # Called from Node.js with filepath argument
        filepath = sys.argv[1]
        try:
            stats = generate_from_excel(filepath)
            print(f"Returned stats: {stats}")
        except Exception as e:
            print(f"Error: {str(e)}", file=sys.stderr)
            sys.exit(1)
    else:
        # Test sample
        print(" Automated Timetable Generation System")
        print("=" * 50)
        
        # Create sample data
        sample_data = {
            'Branch': ['CSE', 'CSE', 'ECE'],
            'Semester': [5, 5, 3],
            'Course Code': ['CS501', 'CS502', 'EC301'],
            'Course Name': ['Algorithms', 'DBMS', 'Signals'],
            'L/T/P': ['3/1/2', '3/0/2', '2/1/2'],
            'Main Faculty': ['Dr. A', 'Dr. B', 'Dr. C'],
            'Co-Faculty': ['Dr. D', '', 'Dr. E']
        }
        df = pd.DataFrame(sample_data)
        
        output_dir = os.path.join(os.path.dirname(__file__), "generated_timetables")
        os.makedirs(output_dir, exist_ok=True)
        test_path = os.path.join(output_dir, 'test_input.xlsx')
        df.to_excel(test_path, index=False)
        
        print("Testing timetable generation with sample data...")
        stats = generate_from_excel(test_path)
        print("Returned stats:", stats) 