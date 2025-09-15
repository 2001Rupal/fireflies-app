using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FirefliesBackend.Migrations
{
    /// <inheritdoc />
    public partial class addingparticipantsfield : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ParticipantCount",
                table: "Meetings",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ParticipantCount",
                table: "Meetings");
        }
    }
}
