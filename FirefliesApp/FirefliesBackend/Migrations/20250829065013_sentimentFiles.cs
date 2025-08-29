using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FirefliesBackend.Migrations
{
    /// <inheritdoc />
    public partial class sentimentFiles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AnalyticsJson",
                table: "Meetings",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<double>(
                name: "SentimentNegativePct",
                table: "Meetings",
                type: "double",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "SentimentNeutralPct",
                table: "Meetings",
                type: "double",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "SentimentPositivePct",
                table: "Meetings",
                type: "double",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AnalyticsJson",
                table: "Meetings");

            migrationBuilder.DropColumn(
                name: "SentimentNegativePct",
                table: "Meetings");

            migrationBuilder.DropColumn(
                name: "SentimentNeutralPct",
                table: "Meetings");

            migrationBuilder.DropColumn(
                name: "SentimentPositivePct",
                table: "Meetings");
        }
    }
}
