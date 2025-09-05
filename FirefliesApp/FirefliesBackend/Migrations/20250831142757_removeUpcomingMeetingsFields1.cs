using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FirefliesBackend.Migrations
{
    /// <inheritdoc />
    public partial class removeUpcomingMeetingsFields1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AttendeeCount",
                table: "Meetings");

            migrationBuilder.DropColumn(
                name: "AttendeesJson",
                table: "Meetings");

            migrationBuilder.DropColumn(
                name: "CalendarSource",
                table: "Meetings");

            migrationBuilder.DropColumn(
                name: "HasFireflies",
                table: "Meetings");

            migrationBuilder.DropColumn(
                name: "IsUpcoming",
                table: "Meetings");

            migrationBuilder.DropColumn(
                name: "IsWorkRelated",
                table: "Meetings");

            migrationBuilder.DropColumn(
                name: "MeetingUrl",
                table: "Meetings");

            migrationBuilder.DropColumn(
                name: "ScheduledEndTime",
                table: "Meetings");

            migrationBuilder.DropColumn(
                name: "ScheduledStartTime",
                table: "Meetings");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AttendeeCount",
                table: "Meetings",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "AttendeesJson",
                table: "Meetings",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "CalendarSource",
                table: "Meetings",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<bool>(
                name: "HasFireflies",
                table: "Meetings",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsUpcoming",
                table: "Meetings",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsWorkRelated",
                table: "Meetings",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "MeetingUrl",
                table: "Meetings",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<DateTime>(
                name: "ScheduledEndTime",
                table: "Meetings",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ScheduledStartTime",
                table: "Meetings",
                type: "datetime(6)",
                nullable: true);
        }
    }
}
