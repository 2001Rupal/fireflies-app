using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FirefliesBackend.Migrations
{
    /// <inheritdoc />
    public partial class addingtemperaturePart : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "OrganizerEmail",
                table: "Meetings",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<double>(
                name: "ProjectPlanTemperature",
                table: "Meetings",
                type: "double",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "OrganizerEmail",
                table: "Meetings");

            migrationBuilder.DropColumn(
                name: "ProjectPlanTemperature",
                table: "Meetings");
        }
    }
}
